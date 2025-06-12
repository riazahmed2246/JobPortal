import { Badge } from '../ui/badge';

export const renderStatusBadge = (status) => {
  const statusLower = status ? status.toLowerCase() : 'pending';
  let badgeColor = 'bg-gray-400';

  if (statusLower === 'accepted') badgeColor = 'bg-green-500';
  else if (statusLower === 'rejected') badgeColor = 'bg-red-500';

  return (
    <Badge className={`${badgeColor} text-white`}>
      {(status || 'Pending').toUpperCase()}
    </Badge>
  );
};
