import React from 'react';
import { Tag } from 'antd';
import type { LoadStatus, PaymentStatus, DriverStatus, BidStatus, DocumentStatus } from '../types';

type AnyStatus = LoadStatus | PaymentStatus | DriverStatus | BidStatus | DocumentStatus | string;

const statusConfig: Record<string, { color: string; label: string }> = {
  // Load statuses
  pending: { color: 'gold', label: 'Pending' },
  active: { color: 'blue', label: 'Active' },
  in_transit: { color: 'processing', label: 'In Transit' },
  delivered: { color: 'success', label: 'Delivered' },
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'default', label: 'Cancelled' },
  delayed: { color: 'warning', label: 'Delayed' },

  // Payment statuses
  paid: { color: 'success', label: 'Paid' },
  overdue: { color: 'error', label: 'Overdue' },
  processing: { color: 'processing', label: 'Processing' },

  // Driver statuses
  pending_approval: { color: 'gold', label: 'Pending Approval' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
  suspended: { color: 'warning', label: 'Suspended' },

  // Bid statuses
  accepted: { color: 'success', label: 'Accepted' },

  // Document statuses
  verified: { color: 'success', label: 'Verified' },
  missing: { color: 'error', label: 'Missing' },
};

interface StatusTagProps {
  status: AnyStatus;
  style?: React.CSSProperties;
}

export default function StatusTag({ status, style }: StatusTagProps) {
  const config = statusConfig[status] || { color: 'default', label: status };
  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '2px 10px',
        border: 'none',
        ...style,
      }}
    >
      {config.label}
    </Tag>
  );
}
