'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import type { DisposalItem, Classification } from '@/lib/trashcan';
import { displayLabel } from '@/lib/display-labels';

interface SuikaTrashcanProps {
  items: DisposalItem[];
  onItemClick?: (item: DisposalItem) => void;
}

type FilterType = 'All' | Classification;

const COLORS: Record<Classification, string> = {
  Trash: '#9CA3AF',     // gray
  Recycling: '#60A5FA', // blue
  Compost: '#34D399',   // green
};

const BORDER_COLORS: Record<Classification, string> = {
  Trash: '#6B7280',
  Recycling: '#3B82F6',
  Compost: '#10B981',
};

function getItemRadius(description: string): number {
  const len = description.length;
  if (len < 8) return 18;
  if (len < 15) return 22;
  return 26;
}

function getItemEmoji(description: string): string {
  const d = description.toLowerCase();
  if (d.includes('bottle') || d.includes('water')) return '🍾';
  if (d.includes('can') || d.includes('soda')) return '🥫';
  if (d.includes('cup') || d.includes('coffee')) return '🥤';
  if (d.includes('banana') || d.includes('peel')) return '🍌';
  if (d.includes('apple')) return '🍎';
  if (d.includes('paper') || d.includes('cardboard')) return '📄';
  if (d.includes('plastic') || d.includes('bag')) return '🛍️';
  if (d.includes('glass')) return '🍷';
  if (d.includes('battery') || d.includes('electronic')) return '🔋';
  if (d.includes('food') || d.includes('leftover')) return '🍽️';
  if (d.includes('diaper')) return '🧷';
  return '♻️';
}

const BIN_WIDTH = 340;
const BIN_HEIGHT = 480;
const WALL_THICKNESS = 60;
const MAX_BODIES = 50;

export default function SuikaTrashcan({ items, onItemClick }: SuikaTrashcanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderLoopRef = useRef<number>(0);
  const bodiesMapRef = useRef<Map<number, DisposalItem>>(new Map());
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedItem, setSelectedItem] = useState<DisposalItem | null>(null);
  const filterRef = useRef(filter);
  const itemsRef = useRef(items);
  const onItemClickRef = useRef(onItemClick);

  // Track items/filter in refs so the render loop can read current values
  // without triggering scene recreation
  itemsRef.current = items;
  filterRef.current = filter;
  onItemClickRef.current = onItemClick;

  const filteredItems = filter === 'All'
    ? items.slice(0, MAX_BODIES)
    : items.filter(i => i.ai_classification === filter).slice(0, MAX_BODIES);

  // Stable key: only recreate scene when filter changes or item count changes
  const sceneKey = `${filter}-${filteredItems.length}`;

  const createScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up previous engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
      if (mouseConstraintRef.current) {
        Matter.Composite.remove(engineRef.current.world, mouseConstraintRef.current);
      }
    }

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.0 } });
    engineRef.current = engine;
    bodiesMapRef.current.clear();

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BIN_WIDTH * dpr;
    canvas.height = BIN_HEIGHT * dpr;
    canvas.style.width = `${BIN_WIDTH}px`;
    canvas.style.height = `${BIN_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // Walls — thick to prevent tunneling on fast drags
    const walls = [
      // Bottom
      Matter.Bodies.rectangle(BIN_WIDTH / 2, BIN_HEIGHT + WALL_THICKNESS / 2, BIN_WIDTH + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true }),
      // Left
      Matter.Bodies.rectangle(-WALL_THICKNESS / 2, BIN_HEIGHT / 2, WALL_THICKNESS, BIN_HEIGHT * 2, { isStatic: true }),
      // Right
      Matter.Bodies.rectangle(BIN_WIDTH + WALL_THICKNESS / 2, BIN_HEIGHT / 2, WALL_THICKNESS, BIN_HEIGHT * 2, { isStatic: true }),
      // Top — prevents items from flying out
      Matter.Bodies.rectangle(BIN_WIDTH / 2, -WALL_THICKNESS / 2, BIN_WIDTH + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true }),
    ];
    Matter.Composite.add(engine.world, walls);

    // Add item bodies with staggered drop
    filteredItems.forEach((item, idx) => {
      const radius = getItemRadius(item.item_description);
      const x = 40 + Math.random() * (BIN_WIDTH - 80);
      const y = -30 - idx * 40; // stagger above the bin

      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.35,
        friction: 0.1,
        density: 0.001,
        label: item.id,
      });

      bodiesMapRef.current.set(body.id, item);
      Matter.Composite.add(engine.world, body);
    });

    // Mouse/touch interaction
    const mouse = Matter.Mouse.create(canvas);
    mouse.pixelRatio = dpr;

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.05,
        damping: 0.1,
        render: { visible: false },
      },
    });
    mouseConstraintRef.current = mouseConstraint;
    Matter.Composite.add(engine.world, mouseConstraint);

    // Drag vs tap detection
    let mouseDownTime = 0;
    let mouseDownPos = { x: 0, y: 0 };
    const TAP_MAX_DURATION = 200; // ms
    const TAP_MAX_DISTANCE = 8;   // px

    Matter.Events.on(mouseConstraint, 'mousedown', () => {
      mouseDownTime = Date.now();
      mouseDownPos = { x: mouse.position.x, y: mouse.position.y };
    });

    // Click detection for item details — only on quick taps, not drags
    Matter.Events.on(mouseConstraint, 'mouseup', (event) => {
      const duration = Date.now() - mouseDownTime;
      const { mouse: m } = event as { mouse: Matter.Mouse };
      const dist = Math.sqrt(
        (m.position.x - mouseDownPos.x) ** 2 +
        (m.position.y - mouseDownPos.y) ** 2
      );

      // Only treat as tap if it was quick and didn't move much
      if (duration > TAP_MAX_DURATION || dist > TAP_MAX_DISTANCE) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.isStatic) continue;
        if (Matter.Bounds.contains(body.bounds, m.position)) {
          const bodyDist = Math.sqrt(
            (body.position.x - m.position.x) ** 2 +
            (body.position.y - m.position.y) ** 2
          );
          if (bodyDist < (body.circleRadius ?? 30) + 5) {
            const item = bodiesMapRef.current.get(body.id);
            if (item) {
              setSelectedItem(item);
              onItemClickRef.current?.(item);
            }
            break;
          }
        }
      }
    });

    // Render loop
    function draw() {
      Matter.Engine.update(engine, 1000 / 60);

      // Clamp velocities to prevent items escaping
      const MAX_SPEED = 8;
      const allBodies = Matter.Composite.allBodies(engine.world);
      for (const body of allBodies) {
        if (body.isStatic) continue;
        const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * scale,
            y: body.velocity.y * scale,
          });
        }
        // Also clamp position inside bin bounds
        const r = body.circleRadius ?? 20;
        if (body.position.x < r) Matter.Body.setPosition(body, { x: r, y: body.position.y });
        if (body.position.x > BIN_WIDTH - r) Matter.Body.setPosition(body, { x: BIN_WIDTH - r, y: body.position.y });
        if (body.position.y < r) Matter.Body.setPosition(body, { x: body.position.x, y: r });
        if (body.position.y > BIN_HEIGHT - r) Matter.Body.setPosition(body, { x: body.position.x, y: BIN_HEIGHT - r });
      }

      ctx.clearRect(0, 0, BIN_WIDTH, BIN_HEIGHT);

      // Draw bin background — color based on active filter
      const currentFilter = filterRef.current;
      const binBgColors: Record<FilterType, string> = {
        All: 'rgba(245, 245, 245, 0.5)',
        Trash: 'rgba(156, 163, 175, 0.15)',
        Recycling: 'rgba(96, 165, 250, 0.15)',
        Compost: 'rgba(52, 211, 153, 0.15)',
      };
      const binBorderColors: Record<FilterType, string> = {
        All: '#D1D5DB',
        Trash: '#9CA3AF',
        Recycling: '#60A5FA',
        Compost: '#34D399',
      };
      ctx.fillStyle = binBgColors[currentFilter];
      ctx.strokeStyle = binBorderColors[currentFilter];
      ctx.lineWidth = 3;
      const binPadding = 2;
      ctx.beginPath();
      ctx.roundRect(binPadding, 0, BIN_WIDTH - binPadding * 2, BIN_HEIGHT - binPadding, [0, 0, 16, 16]);
      ctx.fill();
      ctx.stroke();

      // Draw items
      const bodies = Matter.Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.isStatic) continue;
        const item = bodiesMapRef.current.get(body.id);
        if (!item) continue;

        const { x, y } = body.position;
        const r = body.circleRadius ?? 20;
        const classification = item.ai_classification;

        // Circle fill
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[classification];
        ctx.fill();
        ctx.strokeStyle = BORDER_COLORS[classification];
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji
        const emoji = getItemEmoji(item.item_description);
        ctx.font = `${Math.round(r * 0.9)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x, y);
      }

      renderLoopRef.current = requestAnimationFrame(draw);
    }

    draw();
  }, [sceneKey]);

  useEffect(() => {
    createScene();
    return () => {
      if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
    };
  }, [createScene]);

  const TIPS: Record<string, string> = {
    aluminum_can: 'Rinse cans before recycling to avoid contamination.',
    plastic_bottle: 'Remove caps and rinse bottles before recycling.',
    cardboard: 'Flatten cardboard boxes to save space in the bin.',
    food_waste: 'Composting food waste reduces methane emissions from landfills.',
    electronics: 'Never put electronics in regular trash — use e-waste drop-offs.',
  };

  function getTip(materialType: string | null): string {
    if (!materialType) return 'Every correct disposal makes a difference!';
    return TIPS[materialType] ?? 'Proper disposal helps keep our campus clean and green.';
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Filter buttons */}
      <div className="flex gap-2">
        {(['All', 'Trash', 'Recycling', 'Compost'] as const).map((f) => {
          const label = f === 'Trash' ? 'Landfill' : f;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'Trash' && '🗑️ '}{f === 'Recycling' && '♻️ '}{f === 'Compost' && '🌱 '}
              {label}
            </button>
          );
        })}
      </div>

      {/* Bin lid */}
      <div className="relative" style={{ width: BIN_WIDTH }}>
        <div className={`h-6 rounded-t-2xl flex items-center justify-center shadow-md ${
          filter === 'Trash' ? 'bg-gray-400' :
          filter === 'Recycling' ? 'bg-blue-400' :
          filter === 'Compost' ? 'bg-green-400' :
          'bg-gray-400'
        }`}>
          <div className="w-[50%] h-2 bg-black/20 rounded-sm" />
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className={`block rounded-b-2xl border-2 border-t-0 bg-white/50 cursor-grab active:cursor-grabbing ${
            filter === 'Trash' ? 'border-gray-400' :
            filter === 'Recycling' ? 'border-blue-400' :
            filter === 'Compost' ? 'border-green-400' :
            'border-gray-300'
          }`}
          style={{ width: BIN_WIDTH, height: BIN_HEIGHT, touchAction: 'none' }}
        />
      </div>

      <p className="text-xs text-gray-400">
        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} · Drag to rearrange · Tap for details
      </p>

      {/* Item detail modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center text-4xl mb-3">
              {getItemEmoji(selectedItem.item_description)}
            </div>
            <p className="text-lg font-bold text-gray-800 mb-1 text-center">
              {selectedItem.item_description}
            </p>
            <p className="text-sm text-gray-500 mb-3 text-center">
              {displayLabel(selectedItem.ai_classification)} · {selectedItem.material_type ?? 'unknown'} · {new Date(selectedItem.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3">
              💡 {getTip(selectedItem.material_type)}
            </p>
            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
