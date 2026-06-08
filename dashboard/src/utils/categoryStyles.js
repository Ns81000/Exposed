export function getCategoryStyle(category) {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('advert') || cat.includes('marketing') || cat.includes('ad ')) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20 dark:border-rose-500/30'
    };
  }
  if (cat.includes('analyt') || cat.includes('track') || cat.includes('measure') || cat.includes('stat')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/30'
    };
  }
  if (cat.includes('social') || cat.includes('share') || cat.includes('facebook') || cat.includes('twitter')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20 dark:border-purple-500/30'
    };
  }
  if (cat.includes('content') || cat.includes('cdn') || cat.includes('delivery') || cat.includes('media') || cat.includes('image') || cat.includes('video')) {
    return {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/20 dark:border-sky-500/30'
    };
  }
  if (cat.includes('tag') || cat.includes('manager')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20 dark:border-indigo-500/30'
    };
  }
  if (cat.includes('utility') || cat.includes('essential') || cat.includes('functional') || cat.includes('developer') || cat.includes('api')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/30'
    };
  }
  
  // Default fallback
  return {
    bg: 'bg-surface-3',
    text: 'text-secondary dark:text-secondary',
    border: 'border-border'
  };
}
