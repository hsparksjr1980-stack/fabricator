# Refactoring Plan & Architecture Guide

## Overview

This document outlines a comprehensive refactoring strategy for the Fabricator app, focusing on:
1. Large screen decomposition
2. Proper route cleanup
3. Code organization best practices
4. TypeScript patterns

---

## Part 1: Dashboard Route Cleanup

### Current Issue
Routes often hold references that prevent garbage collection when components unmount.

### Solution

**File:** `fabricator-app/src/navigation/RootNavigator.tsx`

```typescript
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// ❌ BAD: Route never cleans up
export const DashboardRoute = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const subscription = dataService.subscribe(setData);
    // Missing cleanup!
  }, []);

  return <DashboardScreen data={data} />;
};

// ✅ GOOD: Proper cleanup
export const DashboardRoute = () => {
  const [data, setData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const subscription = dataService.subscribe(setData);
      return () => subscription.unsubscribe(); // Cleanup
    }, [])
  );

  return <DashboardScreen data={data} />;
};
```

### Cleanup Checklist
- [ ] Remove all subscriptions on unmount
- [ ] Cancel pending API requests
- [ ] Clear timers/intervals
- [ ] Reset large state objects
- [ ] Use `useFocusEffect` for screen-specific cleanup

---

## Part 2: Dashboard Rendering Refactor

### Rename & Structure

**Current:** `renderDashboardAction`
**Better:** Use proper component hierarchy

```typescript
// ❌ OLD - Functions rendering JSX
const renderDashboardAction = (action: Action) => {
  return <View>{/* complex logic */}</View>;
};

// ✅ NEW - Proper components
export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  action,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Focused responsibility */}
    </TouchableOpacity>
  );
};

export const AdvisorStrip: React.FC<AdvisorStripProps> = ({ actions }) => {
  return (
    <ScrollView>
      {actions.map((action) => (
        <AdvisorCard key={action.id} action={action} />
      ))}
    </ScrollView>
  );
};
```

---

## Part 3: Large Screen Decomposition Strategy

### Example: Dashboard Screen Refactor

**BEFORE:** 1 large file with 1000+ lines

```
fabricator-app/src/screens/
  └── DashboardScreen.tsx (1000+ lines)
```

**AFTER:** Organized into logical components

```
fabricator-app/src/features/dashboard/
  ├── index.ts
  ├── screens/
  │   └── DashboardScreen.tsx (main screen container)
  ├── components/
  │   ├── AdvisorStrip.tsx
  │   ├── AdvisorCard.tsx
  │   ├── SessionTracker.tsx
  │   ├── QuickStats.tsx
  │   └── index.ts (export barrel)
  ├── hooks/
  │   ├── useDashboardData.ts
  │   ├── useSessionTracking.ts
  │   └── index.ts
  ├── types/
  │   └── dashboard.ts
  ├── services/
  │   └── dashboardService.ts
  └── styles/
      └── dashboard.styles.ts
```

### Implementation Pattern

```typescript
// fabricator-app/src/features/dashboard/screens/DashboardScreen.tsx
import { useDashboardData } from '../hooks/useDashboardData';
import { AdvisorStrip, QuickStats, SessionTracker } from '../components';

export const DashboardScreen: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <ScrollView>
      <QuickStats data={data.stats} />
      <SessionTracker session={data.currentSession} />
      <AdvisorStrip actions={data.actions} />
    </ScrollView>
  );
};
```

```typescript
// fabricator-app/src/features/dashboard/hooks/useDashboardData.ts
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { dashboardService } from '../services/dashboardService';

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        try {
          const result = await dashboardService.fetchDashboard();
          if (isMounted) setData(result);
        } catch (err) {
          if (isMounted) setError(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return { data, loading, error };
};
```

---

## Part 4: Swipe Progression for Parts

### Component Structure

```typescript
// fabricator-app/src/features/parts/components/PartSwiper.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, Animated } from 'react-native';

interface Part {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'complete';
}

interface PartSwiperProps {
  parts: Part[];
  onProgressChange: (partId: string, progress: number) => void;
}

export const PartSwiper: React.FC<PartSwiperProps> = ({
  parts,
  onProgressChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleSwipeComplete = useCallback((partId: string) => {
    onProgressChange(partId, 100);
    // Animate to next part
    setActiveIndex((prev) => Math.min(prev + 1, parts.length - 1));
  }, [parts.length, onProgressChange]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      scrollEventThrottle={16}
      onScrollEndDrag={(e) => {
        const index = Math.round(
          e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
        );
        setActiveIndex(index);
      }}
    >
      {parts.map((part) => (
        <PartCard
          key={part.id}
          part={part}
          onComplete={() => handleSwipeComplete(part.id)}
        />
      ))}
    </ScrollView>
  );
};
```

---

## Part 5: Pinned Dashboard Strip

### Layout Strategy

```typescript
// fabricator-app/src/features/dashboard/components/PinnedStrip.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PinnedItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface PinnedStripProps {
  items: PinnedItem[];
  isVisible: boolean;
}

export const PinnedStrip: React.FC<PinnedStripProps> = ({
  items,
  isVisible,
}) => {
  const insets = useSafeAreaInsets();

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom },
      ]}
    >
      {items.map((item) => (
        <PinnedStripItem
          key={item.id}
          item={item}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#ff6b35', // Ember orange
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
});
```

---

## Part 6: Project Structure Setup

### Create folder structure

```bash
cd fabricator-app/src

# Create feature folders
mkdir -p features/{dashboard,parts,sessions,inventory,gallery,advisor}

# Populate each feature
for feature in dashboard parts sessions inventory gallery advisor; do
  mkdir -p features/$feature/{screens,components,hooks,services,types,styles}
  touch features/$feature/index.ts
done

# Organize shared code
mkdir -p {hooks,services,utils,types,theme,constants}
```

---

## Part 7: TypeScript Best Practices

### Type Definitions

```typescript
// fabricator-app/src/types/index.ts
export type BuildStatus = 'planning' | 'in-progress' | 'complete' | 'archived';
export type SessionType = 'building' | 'planning' | 'review';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: BuildStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildSession {
  id: string;
  projectId: string;
  type: SessionType;
  startTime: Date;
  endTime?: Date;
  notes: string;
}

export interface Part {
  id: string;
  projectId: string;
  name: string;
  status: 'pending' | 'in-progress' | 'complete';
  progress: number;
}

// Feature-specific types
// fabricator-app/src/features/dashboard/types/dashboard.ts
export interface DashboardStats {
  activeProjects: number;
  hoursThisWeek: number;
  completedTasks: number;
  upcomingDeadlines: number;
}
```

---

## Implementation Order (Recommended)

1. **Week 1: Foundation**
   - [ ] Create folder structure
   - [ ] Set up type definitions
   - [ ] Add barrel exports (index.ts files)

2. **Week 2: Dashboard**
   - [ ] Decompose DashboardScreen
   - [ ] Extract custom hooks (useDashboardData)
   - [ ] Fix route cleanup
   - [ ] Rename to advisor pattern

3. **Week 3: Features**
   - [ ] Implement PartSwiper
   - [ ] Build PinnedStrip component
   - [ ] Add SessionTracker component

4. **Week 4: Polish**
   - [ ] Add error boundaries
   - [ ] Optimize re-renders (useMemo, useCallback)
   - [ ] Add proper loading states
   - [ ] Write unit tests

---

## Code Quality Checklist

- [ ] Every component has JSDoc comments
- [ ] All functions have explicit return types
- [ ] No `any` types (use proper TypeScript)
- [ ] Custom hooks extracted where logic is reused
- [ ] Services handle all API calls
- [ ] Components are under 300 lines (max)
- [ ] Proper cleanup in useEffect/useFocusEffect
- [ ] Error handling for all async operations

---

## Resources

- [React Native Navigation](https://reactnavigation.org/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript React Patterns](https://react-typescript-cheatsheet.netlify.app/)
- [Feature-based Architecture](https://martinfowler.com/articles/modular-architecture.html)

---

**Next Steps:** Review this plan and let me know which feature you'd like to start with!
