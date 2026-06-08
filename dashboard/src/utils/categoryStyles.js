export function getCategoryStyle(category) {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('advert') || cat.includes('marketing') || cat.includes('ad ')) {
    return {
      bg: 'bg-red-500/8',
      text: 'text-[#ff6161]',
      border: 'border-red-500/20'
    };
  }
  if (cat.includes('analyt') || cat.includes('track') || cat.includes('measure') || cat.includes('stat')) {
    return {
      bg: 'bg-amber-500/8',
      text: 'text-[#ffc533]',
      border: 'border-amber-500/20'
    };
  }
  if (cat.includes('social') || cat.includes('share') || cat.includes('facebook') || cat.includes('twitter')) {
    return {
      bg: 'bg-purple-500/8',
      text: 'text-[#b48cff]',
      border: 'border-purple-500/20'
    };
  }
  if (cat.includes('content') || cat.includes('cdn') || cat.includes('delivery') || cat.includes('media') || cat.includes('image') || cat.includes('video')) {
    return {
      bg: 'bg-sky-500/8',
      text: 'text-[#57c1ff]',
      border: 'border-sky-500/20'
    };
  }
  if (cat.includes('tag') || cat.includes('manager')) {
    return {
      bg: 'bg-indigo-500/8',
      text: 'text-[#828fff]',
      border: 'border-indigo-500/20'
    };
  }
  if (cat.includes('utility') || cat.includes('essential') || cat.includes('functional') || cat.includes('developer') || cat.includes('api')) {
    return {
      bg: 'bg-emerald-500/8',
      text: 'text-[#59d499]',
      border: 'border-emerald-500/20'
    };
  }
  
  // Default fallback
  return {
    bg: 'bg-surface-3',
    text: 'text-secondary',
    border: 'border-border'
  };
}
