# 🎬 Framer Motion Integration Guide

## ✅ What's Been Added to Your EXISTING Stack

You **don't need Next.js**! Your current Vite + React + TypeScript setup now has everything you requested:

### 📦 **Installed**
```bash
✅ framer-motion - Spring physics animations  
✅ Plus Jakarta Sans - Modern geometric font (add to index.html)
✅ Lucide React - Already installed
✅ Tailwind CSS - Already configured
```

---

## 🎨 **New Framer Motion Components**

### 1. **FramerDashboard** - Staggered Card Animations
**File:** `src/components/beeyield/FramerDashboard.tsx`

**Features:**
- ✨ Staggered entrance animations (cards appear one by one)
- 🎯 Hover lift with scale transform
- 💫 Spring physics transitions
- 📊 Live activity feed with pulse indicators

**Usage:**
```tsx
import FramerDashboard from '@/components/beeyield/FramerDashboard';

<FramerDashboard onTabChange={handleTabChange} />
```

---

### 2. **FlipCardHive** - 3D Hive Cards
**File:** `src/components/beeyield/FlipCardHive.tsx`

**Features:**
- 🔄 3D flip animation (click to reveal details)
- 🎯 Spring physics rotation
- 💚 Status indicators with glow effects
- 📱 Touch-friendly interactions

**Usage:**
```tsx
import FlipCardHive from '@/components/beeyield/FlipCardHive';

const hiveData = {
  id: 'hive-001',
  name: 'Hive #01',
  weight: 45.2,
  temp: 34.5,
  humidity: 65,
  status: 'ok' // or 'warning' | 'critical'
};

<FlipCardHive 
  hive={hiveData}
  onViewHistory={(id) => console.log('View history', id)}
  onMarkInspection={(id) => console.log('Mark inspection', id)}
/>
```

**Hive Grid Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {hives.map(hive => (
    <FlipCardHive key={hive.id} hive={hive} />
  ))}
</div>
```

---

### 3. **GlassSidebar** - Animated Navigation
**File:** `src/components/beeyield/GlassSidebar.tsx`

**Features:**
- 💎 Glassmorphism effect (backdrop-blur)
- ✨ Animated "glowing pill" for active state (Framer's layoutId)
- 🎯 Smooth tab transitions
- 🔄 Logo hover rotation

**Usage:**
```tsx
import GlassSidebar from '@/components/beeyield/GlassSidebar';

<GlassSidebar
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onLogout={handleLogout}
/>
```

---

## 🎬 **Animation Patterns**

### **Staggered List Entrance**
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### **Hover Lift with Scale**
```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  whileTap={{ scale: 0.95 }}
>
  Card content
</motion.div>
```

### **Smooth Active State (Layout Animation)**
```tsx
{isActive && (
  <motion.div
    layoutId="activeTab"
    className="absolute inset-0 bg-amber-500/10"
    transition={{ type: "spring", stiffness: 400 }}
  />
)}
```

### **3D Flip Card**
```tsx
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6, type: "spring" }}
  style={{ transformStyle: 'preserve-3d' }}
>
  {/* Front and back faces */}
</motion.div>
```

---

## 🔧 **Integration into BeeYieldDashboard**

Add these new views to your existing dashboard:

### **Step 1: Import Components**
```tsx
// In src/pages/BeeYieldDashboard.tsx
import FramerDashboard from '@/components/beeyield/FramerDashboard';
import FlipCardHive from '@/components/beeyield/FlipCardHive';
import GlassSidebar from '@/components/beeyield/GlassSidebar';
```

### **Step 2: Add Navigation Items**
```tsx
const navItems: NavItem[] = [
  { id: 'framer-demo', label: '🎬 Framer Motion Demo', icon: LayoutGrid },
  { id: 'hives-3d', label: '🐝 3D Hive Cards', icon: Box },
  // ... existing items
];
```

### **Step 3: Add Route Cases**
```tsx
const renderContent = () => {
  switch (activeTab) {
    case 'framer-demo':
      return <FramerDashboard onTabChange={handleTabChange} />;
      
    case 'hives-3d':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockHives.map(hive => (
            <FlipCardHive key={hive.id} hive={hive} />
          ))}
        </div>
      );
      
    // ... existing cases
  }
};
```

---

## 🎨 **Font Setup**

Add Plus Jakarta Sans to your `index.html`:

```html
<!-- In index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Update `src/index.css`:
```css
html {
  font-family: 'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui;
}
```

---

## 🎯 **Complete Example: Hive View with Flip Cards**

```tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FlipCardHive from '@/components/beeyield/FlipCardHive';
import { beeyieldService } from '@/services/beeyieldService';

const HivesView: React.FC = () => {
  const [hives, setHives] = useState([]);

  useEffect(() => {
    // Load hive data
    beeyieldService.getHives().then(setHives);
  }, []);

  return (
    <div className="space-y-6 animate-enter">
      <header>
        <h2 className="text-3xl font-bold">Smart Hives</h2>
        <p className="text-gray-500">Click any hive to flip and see controls</p>
      </header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {hives.map((hive, idx) => (
          <motion.div
            key={hive.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <FlipCardHive 
              hive={{
                id: hive.id,
                name: hive.name,
                weight: hive.weight || 0,
                temp: hive.temperature || 0,
                humidity: hive.humidity || 0,
                status: hive.status || 'ok'
              }}
              onViewHistory={(id) => console.log('View history', id)}
              onMarkInspection={(id) => console.log('Inspection', id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HivesView;
```

---

## 📚 **Framer Motion Resources**

- **Docs:** https://www.framer.com/motion/
- **Examples:** https://www.framer.com/motion/examples/
- **layoutId:** https://www.framer.com/motion/layout-animations/
- **Gestures:** https://www.framer.com/motion/gestures/

---

## 🎁 **Bonus: Label Studio Component**

Here's a quick implementation adapted for your stack:

```tsx
// src/components/beeyield/LabelStudio.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LabelStudio: React.FC = () => {
  const [text, setText] = useState("Pure Acacia Honey");
  const [color, setColor] = useState("#F59E0B");

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div 
          className="w-[500px] h-[300px] bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center relative"
          style={{ border: `4px solid ${color}` }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute top-4 right-4 w-16 h-16 bg-black flex items-center justify-center text-white text-xs">
            QR
          </div>
          <h1 className="text-4xl font-serif text-gray-900 text-center px-8">
            {text}
          </h1>
          <p className="mt-2 text-gray-500 font-sans tracking-widest text-sm uppercase">
            Net Wt. 500g
          </p>
          <div 
            className="absolute bottom-0 w-full h-2" 
            style={{ backgroundColor: color }} 
          />
        </motion.div>
      </div>

      {/* Controls */}
      <div className="w-80 glass-hive p-6 flex flex-col gap-6">
        <h3 className="text-xl font-bold">Label Settings</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Brand Name</label>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Accent Color</label>
          <div className="flex gap-2">
            {['#F59E0B', '#10B981', '#3B82F6', '#EF4444'].map(c => (
              <motion.button 
                key={c}
                onClick={() => setColor(c)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full border-2 ${color === c ? 'border-black scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-interactive bg-[hsl(var(--honey-gold))] text-black font-bold py-3 rounded-xl mt-auto"
        >
          Download PDF
        </motion.button>
      </div>
    </div>
  );
};

export default LabelStudio;
```

---

## ✅ **Summary**

**You now have Framer Motion in your CURRENT stack:**
- ✅ Staggered dashboard animations
- ✅ 3D flip cards for hives
- ✅ Glassmorphism sidebar with animated pills
- ✅ Spring physics on all interactions
- ✅ All integrated with your existing Vite + React app

**No migration to Next.js needed!** Your current setup is faster for development and already has all the pieces. 🎉
