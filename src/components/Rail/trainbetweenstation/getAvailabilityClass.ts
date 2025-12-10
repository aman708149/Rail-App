export const getAvailabilityClass = (status?: string) => {
    if (!status) return 'bg-secondary';
  
    if (status.startsWith('AVAILABLE') || status.endsWith('/AVAILABLE') || status.startsWith('CURR')) return 'bg-success';
    if (status.includes('RAC')) return 'bg-warning';
    if (status.startsWith('RLWL') || status.startsWith('WL') || status.startsWith('PQWL') || status.includes('GNWL')) return 'bg-danger';
    if (status === 'REGRET') return 'bg-secondary';
    if (status === 'TRAIN DEPARTED' || status.includes('CANCELLED') || status.includes('NOT')) return 'bg-secondary';
  
    return 'bg-secondary';
  };
  
  export const getAvailabilityTextClass = (status?: string) => {
    if (!status) return 'text-secondary';
  
    if (status.startsWith('AVAILABLE') || status.endsWith('/AVAILABLE') || status.startsWith('CURR'))  return 'text-success';
    if (status.includes('RAC')) return 'text-warning';
    if (status.startsWith('RLWL') || status.startsWith('WL') || status.startsWith('PQWL') || status.includes('GNWL')) return 'text-danger';
    if (status === 'REGRET') return 'text-secondary';
    if (status === 'TRAIN DEPARTED' || status.includes('CANCELLED') || status.includes('NOT')) return 'text-secondary';
  
    return 'text-secondary';
  };


  export const getAvailabilityClassCode = (status?: string) => {
    if (!status) return 'secondary';
  
    if (status.startsWith('AVAILABLE') || status.endsWith('/AVAILABLE') || status.startsWith('CURR')) return 'success';
    if (status.includes('RAC')) return 'warning';
    if (status.startsWith('RLWL') || status.startsWith('WL') || status.startsWith('PQWL') || status.startsWith('TQWL')|| status.includes('GNWL')) return 'danger';
    if (status === 'REGRET') return 'secondary';
    if (status === 'TRAIN DEPARTED' || status.includes('CANCELLED') || status.includes('NOT')) return 'secondary';
  
    return 'secondary';
  };

  export const CheckButtonStatus = (status?: string) : boolean => {
    if (!status) return true;
  
    if (status.startsWith('AVAILABLE') || status.startsWith('CURR')) return false;
    if (status.includes('RAC')) return false;
    if (status.startsWith('RLWL') || status.startsWith('WL') || status.startsWith('PQWL') || status.startsWith('TQWL') || status.includes('GNWL')) return false;
    if (status === 'REGRET') return false;
    if (status === 'TRAIN DEPARTED' || status.includes('CANCELLED') || status.includes('NOT')) return true;

    return false;
  };
  
  
  