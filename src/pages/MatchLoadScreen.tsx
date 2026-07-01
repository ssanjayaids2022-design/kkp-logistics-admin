import React, { useState } from 'react';
import { Card as AntdCard, Row, Col, Select, Button, Modal, Rate, Avatar, message, Alert, Tag, Empty, Typography, Popconfirm, Descriptions } from 'antd';
const Card = AntdCard as any;
import { CheckOutlined, ThunderboltOutlined, UserAddOutlined, CloseOutlined, SwapOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import StatusTag from '../components/StatusTag';
import { useAuth } from '../context/AuthContext';
import { useLoads } from '../context/LoadsContext';
import { apiService, type MatchCandidate } from '../services/apiService';
import type { Driver, Load } from '../types';

const { Text } = Typography;
const CLOSED = ['delivered', 'completed', 'cancelled'];
const isActiveAssigned = (l: Load) => !!l.assignedDriver && !CLOSED.includes(l.status);

export default function MatchLoadScreen() {
  const { loadId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loads, refresh } = useLoads();
  const isChairman = user?.role === 'CHAIRMAN';

  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<MatchCandidate | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDriverId, setManualDriverId] = useState<string | undefined>();

  const load = loads.find(l => l.id === loadId);

  React.useEffect(() => {
    apiService.fetchDrivers().then(setAllDrivers).catch(() => setAllDrivers([]));
  }, []);

  const loadCandidates = React.useCallback(async () => {
    if (!loadId) return;
    setLoading(true);
    try {
      const res = await apiService.fetchCandidates(loadId);
      setCandidates(res.candidates);
      setAssignedDriverId(res.assignedDriverId);
    } catch (e) {
      message.error(`Failed to load drivers: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [loadId]);

  React.useEffect(() => {
    loadCandidates();
    const t = setInterval(loadCandidates, 8000);
    return () => clearInterval(t);
  }, [loadCandidates]);

  const driverName = (x?: string | null) => allDrivers.find(d => d.id === x)?.name || x || '—';
  const busyLoadFor = (driverId: string, name: string) =>
    loads.find(l => l.id !== loadId && isActiveAssigned(l) && (l.assignedDriver === driverId || l.assignedDriver === name))?.id;

  const raisedHands = candidates.filter(c => c.engaged);
  const isAssigned = !!assignedDriverId;
  const assignedLabel = driverName(assignedDriverId);
  const manualDriver = allDrivers.find(d => d.id === manualDriverId);

  const doAssign = async (driverId: string, name: string) => {
    try {
      if (isAssigned) await apiService.reassignDriver(loadId, driverId, false);
      else await apiService.assignDriver(loadId, driverId, false);
      message.success(`${name} assigned to ${loadId}.`);
      setConfirm(null);
      setManualOpen(false);
      setManualDriverId(undefined);
      await Promise.all([loadCandidates(), refresh()]);
    } catch (e) {
      message.error(`Failed to assign: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const handleUnassign = async () => {
    try {
      await apiService.unassignLoad(loadId);
      message.success(`Load ${loadId} unassigned — ready to re-match.`);
      await Promise.all([loadCandidates(), refresh()]);
    } catch (e) {
      message.error(`Failed to unassign: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  };

  const backBtn = (
    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/match')} className="kkp-text-navy kkp-weight-600" style={{ paddingLeft: 0, marginBottom: 8 }}>
      Back to Match
    </Button>
  );

  if (!load) {
    return (
      <div>
        {backBtn}
        <Card className="kkp-card"><Empty description="Load not found." /></Card>
      </div>
    );
  }

  return (
    <div>
      {backBtn}
      <PageHeader
        title={`Match ${load.id}`}
        subtitle={`${raisedHands.length} driver${raisedHands.length === 1 ? '' : 's'} raised their hand`}
        extra={!isChairman && (
          <GoldButton icon={<UserAddOutlined />} onClick={() => { setManualDriverId(undefined); setManualOpen(true); }}>
            Add driver manually
          </GoldButton>
        )}
      />

      <Card className="kkp-card" style={{ marginBottom: 16 }}>
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4 }}
          labelStyle={{ color: '#475467', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          contentStyle={{ color: '#101828', fontWeight: 600 }}
        >
          <Descriptions.Item label="Route">{load.source} → {load.destination}</Descriptions.Item>
          <Descriptions.Item label="Vehicle">{load.vehicleType}</Descriptions.Item>
          <Descriptions.Item label="Weight">{load.weight > 100 ? (load.weight / 1000).toFixed(1) : load.weight} Tons</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusTag status={load.status as any} /></Descriptions.Item>
        </Descriptions>
      </Card>

      {isAssigned && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
          message={<span className="kkp-text-dark">Currently assigned to <strong className="kkp-text-navy">{assignedLabel}</strong></span>}
          description={<span className="kkp-text-drab" style={{ fontSize: 12 }}>Pick another driver below to change, or unassign to cancel the match.</span>}
          action={!isChairman && (
            <Popconfirm title={`Unassign ${assignedLabel} from ${load.id}?`} okText="Unassign" onConfirm={handleUnassign}>
              <Button size="small" danger icon={<CloseOutlined />}>Unassign</Button>
            </Popconfirm>
          )}
        />
      )}

      {raisedHands.length === 0 ? (
        <Card className="kkp-card">
          <Empty description={loading ? 'Loading…' : 'No drivers have raised their hands for this load yet.'}>
            {!isChairman && (
              <GoldButton icon={<UserAddOutlined />} onClick={() => { setManualDriverId(undefined); setManualOpen(true); }}>
                Add driver manually
              </GoldButton>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {raisedHands.map(c => {
            const busy = busyLoadFor(c.driverId, c.name);
            return (
              <Col xs={24} sm={12} lg={8} key={c.driverId}>
                <div style={{ border: '1px solid #E4E7EC', borderRadius: 10, padding: 12, opacity: busy && !c.isAssigned ? 0.7 : 1 }}>
                  <div className="kkp-items-center kkp-gap-8 kkp-mb-8">
                    <Avatar size={36} style={{ backgroundColor: '#0B4C8C', color: '#FFFFFF', fontWeight: 700 }}>{c.name.charAt(0)}</Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong className="kkp-text-dark" style={{ display: 'block', fontSize: 14 }}>{c.name}</Text>
                      <Text className="kkp-text-drab" style={{ fontSize: 11 }}>{c.vehicleType} · {c.region}</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="kkp-text-navy kkp-weight-800" style={{ fontSize: 16, lineHeight: 1 }}>{c.score}</div>
                      <Text className="kkp-text-drab" style={{ fontSize: 8, letterSpacing: '0.08em' }}>SCORE</Text>
                    </div>
                  </div>
                  <div className="kkp-flex-between kkp-items-center kkp-mb-8">
                    <Rate disabled defaultValue={c.rating} allowHalf style={{ fontSize: 11, color: '#FFC20E' }} />
                    <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                      <ThunderboltOutlined /> {c.engaged === 'quote' ? `Quoted ₹${(c.quoteAmount || 0).toLocaleString()}` : 'Raised hand'}
                    </Tag>
                  </div>
                  {c.isAssigned ? (
                    <Tag color="green" style={{ width: '100%', textAlign: 'center', margin: 0, padding: '4px 0', borderRadius: 8 }}>Assigned to this load</Tag>
                  ) : busy ? (
                    <Tag color="gold" style={{ width: '100%', textAlign: 'center', margin: 0, padding: '4px 0', borderRadius: 8 }}>Already assigned to {busy}</Tag>
                  ) : (
                    <GoldButton icon={isAssigned ? <SwapOutlined /> : <CheckOutlined />} style={{ width: '100%' }} disabled={isChairman} onClick={() => setConfirm(c)}>
                      {isAssigned ? 'Change to this driver' : 'Assign'}
                    </GoldButton>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Assign confirm */}
      <Modal
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onOk={() => confirm && doAssign(confirm.driverId, confirm.name)}
        title={<span className="kkp-text-dark">{isAssigned ? 'Confirm Driver Change' : 'Confirm Assignment'}</span>}
        okText={isAssigned ? 'Change driver' : 'Assign'}
        okButtonProps={{ style: { background: '#0B4C8C', border: 'none', color: '#FFFFFF', fontWeight: 700 } }}
      >
        {confirm && (
          <p className="kkp-text-muted">
            {isAssigned ? 'Change' : 'Assign'} load <strong className="kkp-text-navy">{load.id}</strong> to{' '}
            <strong className="kkp-text-dark">{confirm.name}</strong> (match score {confirm.score})?
          </p>
        )}
      </Modal>

      {/* Manual add */}
      <Modal
        open={manualOpen}
        onCancel={() => { setManualOpen(false); setManualDriverId(undefined); }}
        onOk={() => { const d = allDrivers.find(x => x.id === manualDriverId); if (d) doAssign(d.id, d.name); }}
        okText={isAssigned ? 'Change driver' : 'Assign'}
        okButtonProps={{ disabled: !manualDriverId, style: { background: '#0B4C8C', border: 'none', color: '#FFFFFF', fontWeight: 700 } }}
        title={<span className="kkp-text-dark"><UserAddOutlined style={{ marginRight: 8, color: '#0B4C8C' }} />Assign driver manually</span>}
        destroyOnClose
      >
        <p className="kkp-text-muted" style={{ marginTop: 0 }}>
          Search a driver by name or ID and assign them to <strong className="kkp-text-navy">{load.id}</strong>.
        </p>
        <Select
          showSearch
          value={manualDriverId}
          onChange={setManualDriverId}
          placeholder="Search driver by name or ID"
          style={{ width: '100%' }}
          filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
          options={allDrivers.map(d => {
            const busy = busyLoadFor(d.id, d.name);
            return {
              value: d.id,
              disabled: !!busy,
              label: `${d.name} · ${d.id} · ${d.vehicleType} · ${busy ? `on ${busy}` : d.status.replace('_', ' ')}`,
            };
          })}
        />
        {manualDriver && manualDriver.status !== 'approved' && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message="Driver not verified"
            description={`${manualDriver.name} is ${manualDriver.status.replace('_', ' ')}. You can still assign them, but they haven't completed verification.`}
          />
        )}
      </Modal>
    </div>
  );
}
