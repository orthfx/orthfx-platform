import type { Parish } from '../types/parish';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Phone, Mail, Globe } from 'lucide-react';

interface ParishListProps {
  parishes: Parish[];
  selectedParishId?: string;
  onParishClick?: (parish: Parish) => void;
}

export function ParishList({ parishes, selectedParishId, onParishClick }: ParishListProps) {
  return (
    <div className="space-y-2 p-4">
      {parishes.map((parish) => (
        <Card
          key={parish.uid}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedParishId === parish.uid ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onParishClick?.(parish)}
        >
          <h3 className="font-bold text-sm text-primary mb-1">{parish.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {[parish.city, parish.state, parish.country].filter(Boolean).join(', ')}
          </p>

          {parish.organization && (
            <p className="text-xs text-muted-foreground italic mb-2">{parish.organization}</p>
          )}

          {parish.clergy && parish.clergy.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-foreground">
                {parish.clergy[0].name}{parish.clergy[0].role ? ` - ${parish.clergy[0].role}` : ''}
              </p>
              {parish.clergy.length > 1 && (
                <p className="text-xs text-muted-foreground italic">+{parish.clergy.length - 1} more</p>
              )}
            </div>
          )}

          {parish.contact && (
            <div className="flex gap-2 mb-2">
              {parish.contact.phone && (
                <span title={parish.contact.phone}>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
              {parish.contact.email && (
                <span title={parish.contact.email}>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
              {parish.contact.website && (
                <span title="Website">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
            </div>
          )}

          {parish.additional_info?.service_languages && (
            <Badge variant="secondary" className="text-xs">
              {parish.additional_info.service_languages}
            </Badge>
          )}

          <a
            href={parish.detail_url || parish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline block mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            View Details →
          </a>
        </Card>
      ))}
    </div>
  );
}
