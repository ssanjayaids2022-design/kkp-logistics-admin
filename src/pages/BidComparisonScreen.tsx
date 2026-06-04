import React, { useState } from 'react';
import { Card as AntdCard, Row, Col, Select, Descriptions, Button, Modal, Rate, Avatar, Space, Typography, message } from 'antd';
const Card = AntdCard as any;
import {
  CarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import { useLocation } from 'react-router-dom';
import { bids, loads } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import type { Bid } from '../types';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

export default function BidComparisonScreen() {
  const [sortBy, setSortBy] = useState<string>('price');
  const [selectedLoadId, setSelectedLoadId] = useState<string>('LD-1001');
  const [confirmModal, setConfirmModal] = useState<Bid | null>(null);
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();

  const isChairman = user?.role === 'CHAIRMAN';

  React.useEffect(() => {
    if (location.state?.selectedLoadId) {
      setSelectedLoadId(location.state.selectedLoadId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const selectedLoad = loads.find(l => l.id === selectedLoadId);
  const loadBids = bids
    .filter(b => b.loadId === selectedLoadId)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.driverRating - a.driverRating;
      return 0;
    });

  const loadsWithBids = loads.filter(l => l.bidsCount > 0);

  const handleAssign = (bid: Bid) => {
    message.success(`Driver ${bid.driverName} assigned to ${selectedLoadId}!`);
    setConfirmModal(null);
  };

  return (
    <div>
      <PageHeader
        title={t('bids.title')}
        subtitle={`${t('bids.comparing')} ${loadBids.length} ${t('bids.bidsFor')} ${selectedLoadId}`}
      />

      {/* Load Selector & Sort */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        <Col xs={14} md={8}>
          <Select
            value={selectedLoadId}
            onChange={setSelectedLoadId}
            style={{ width: '100%' }}
            options={loadsWithBids.map(l => ({
              value: l.id,
              label: `${l.id} — ${l.source} → ${l.destination}`,
            }))}
          />
        </Col>
        <Col xs={10} md={4}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: '100%' }}
            options={[
              { value: 'price', label: t('bids.sortLowest') },
              { value: 'rating', label: t('bids.sortRating') },
            ]}
          />
        </Col>
      </Row>

      {/* Load Details */}
      {selectedLoad && (
        <Card className="kkp-card" style={{ marginBottom: 20 }}>
          <Descriptions
            column={{ xs: 1, sm: 2, md: 4 }}
            labelStyle={{ color: '#475467', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            contentStyle={{ color: '#101828', fontWeight: 600 }}
          >
            <Descriptions.Item label={t('loads.route')}>{selectedLoad.source} → {selectedLoad.destination}</Descriptions.Item>
            <Descriptions.Item label={t('loads.vehicle')}>{selectedLoad.vehicleType}</Descriptions.Item>
            <Descriptions.Item label={t('loads.weight')}>{selectedLoad.weight > 100 ? (selectedLoad.weight / 1000).toFixed(1) : selectedLoad.weight} Tons</Descriptions.Item>
            <Descriptions.Item label={t('loads.budget')}>
              {selectedLoad.priceType === 'per_ton' ? (
                <span>
                  <span className="kkp-text-gold kkp-weight-700">₹{selectedLoad.ratePerTon?.toLocaleString()}/Ton</span>
                  <span className="kkp-text-drab" style={{ fontSize: 12, marginLeft: 8 }}>(Total: ₹{selectedLoad.budget.toLocaleString()})</span>
                </span>
              ) : (
                <span>
                  <span className="kkp-text-gold kkp-weight-700">₹{selectedLoad.budget.toLocaleString()}</span>
                  <span className="kkp-text-drab" style={{ fontSize: 12, marginLeft: 8 }}>(Fixed)</span>
                </span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Bid Cards */}
      <Row gutter={[16, 16]}>
        {loadBids.map((bid, index) => (
          <Col xs={24} sm={12} lg={8} key={bid.id}>
            <Card
              className={index === 0 ? 'kkp-card kkp-card-accent' : 'kkp-card'}
              style={{ position: 'relative', overflow: 'hidden' }}
              hoverable
            >
              {index === 0 && sortBy === 'price' && (
                <div className="kkp-btn-gold kkp-pos-absolute kkp-weight-800 kkp-text-caption" style={{
                  top: 12,
                  right: 12,
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: 10,
                  background: '#FFC20E',
                  color: '#0F172A',
                }}>
                  <TrophyOutlined /> {t('bids.bestPrice')}
                </div>
              )}

              <div className="kkp-items-center kkp-gap-12 kkp-mb-16">
                <Avatar size={48} style={{ backgroundColor: '#0B4C8C', color: '#FFFFFF', fontWeight: 700, fontSize: 18 }}>
                  {bid.driverName.charAt(0)}
                </Avatar>
                <div>
                  <Text strong className="kkp-text-dark" style={{ fontSize: 15, display: 'block' }}>
                    {bid.driverName}
                  </Text>
                  <div className="kkp-items-center kkp-gap-8">
                    <Rate disabled defaultValue={bid.driverRating} allowHalf
                      style={{ fontSize: 12, color: '#FFC20E' }}
                    />
                    <Text style={{ color: '#667085', fontSize: 12 }}>{bid.driverRating}</Text>
                  </div>
                </div>
              </div>

              <div className="kkp-flex-col kkp-gap-12 kkp-mb-16">
                <div className="kkp-flex-between kkp-items-center">
                  <Text className="kkp-text-drab" style={{ fontSize: 12 }}><DollarOutlined /> {t('bids.bidPrice')}</Text>
                  <Text strong className="kkp-text-gold" style={{ fontSize: 18 }}>₹{bid.price.toLocaleString()}</Text>
                </div>
                <div className="kkp-flex-between">
                  <Text className="kkp-text-drab" style={{ fontSize: 12 }}><CarOutlined /> {t('loads.vehicle')}</Text>
                  <Text className="kkp-text-dark" style={{ fontSize: 12 }}>{bid.vehicleNumber}</Text>
                </div>
                <div className="kkp-flex-between">
                  <Text className="kkp-text-drab" style={{ fontSize: 12 }}><ClockCircleOutlined /> ETA</Text>
                  <Text className="kkp-text-dark" style={{ fontSize: 12 }}>{bid.eta}</Text>
                </div>
                <div className="kkp-flex-between">
                  <Text className="kkp-text-drab" style={{ fontSize: 12 }}><EnvironmentOutlined /> {t('drivers.trips')}</Text>
                  <Text className="kkp-text-dark" style={{ fontSize: 12 }}>{bid.totalTrips} {t('bids.trips')}</Text>
                </div>
              </div>

              <Space style={{ width: '100%' }}>
                <GoldButton
                  icon={<CheckOutlined />}
                  onClick={() => setConfirmModal(bid)}
                  style={{ flex: 1 }}
                  disabled={isChairman}
                >
                  {t('bids.assign')}
                </GoldButton>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  style={{ borderRadius: 10 }}
                  disabled={isChairman}
                >
                  {t('bids.reject')}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={!!confirmModal}
        onCancel={() => setConfirmModal(null)}
        onOk={() => confirmModal && handleAssign(confirmModal)}
        title={<span className="kkp-text-dark">{t('bids.confirmTitle')}</span>}
        okText={t('bids.confirmBtn')}
        okButtonProps={{
          style: {
            background: '#0B4C8C',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
          }
        }}
      >
        {confirmModal && (
          <div>
            <p className="kkp-text-muted">
              Are you sure you want to assign <strong className="kkp-text-dark">{confirmModal.driverName}</strong> to
              load <strong className="kkp-text-navy">{selectedLoadId}</strong> at a price of{' '}
              <strong className="kkp-text-navy">₹{confirmModal.price.toLocaleString()}</strong>?
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
