import React, { useState } from 'react';
import { Card as AntdCard, Row, Col, Select, Button, Modal, Avatar, message, Alert, Tag, Empty, Typography, Popconfirm, Descriptions, InputNumber } from 'antd';
const Card = AntdCard as any;
import { CheckOutlined, ThunderboltOutlined, UserAddOutlined, CloseOutlined, SwapOutlined, ArrowLeftOutlined, LockOutlined, UnlockOutlined, EditOutlined, PhoneOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import StatusTag from '../components/StatusTag';
import { useAuth } from '../context/AuthContext';
import { useLoads } from '../context/LoadsContext';
import { apiService, type MatchCandidate } from '../services/apiService';
import { useDriverLocks, lockDriver, unlockDriver } from '../services/driverLocks';
import type { Driver, Load } from '../types';

const { Text } = Typography;
const CLOSED = ['delivered', 'completed', 'cancelled'];
const isActiveAssigned = (l: Load) => !!l.assignedDriver && !CLOSED.includes(l.status);

export default function MatchLoadScreen() {
  const { loadId = '' } = useParams();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  const { loads, refresh, updatePricing } = useLoads();
  const canAssign = can('match.assign');
  const canSeeAssignedBy = user?.role === 'MANAGER' || user?.role === 'TECH_ADMIN';

  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<MatchCandidate | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDriverId, setManualDriverId] = useState<string | undefined>();
  // Editable per-driver quote (survives the 8s candidate refresh).
  const [quoteDraft, setQuoteDraft] = useState<Record<string, number>>({});
  const [editingQuote, setEditingQuote] = useState<Record<string, boolean>>({});
  const [shownPhones, setShownPhones] = useState<Record<string, boolean>>({});
  const locks = useDriverLocks();

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
  // The other active load a driver is already on (i.e. another agent is dealing with them).
  const busyLoadFor = (driverId: string, name: string): Load | undefined =>
    loads.find(l => l.id !== loadId && isActiveAssigned(l) && (l.assignedDriver === driverId || l.assignedDriver === name));

  const raisedHands = candidates.filter(c => c.engaged);

  // Seed the editable quote for any newly-seen driver (don't clobber edits).
  React.useEffect(() => {
    setQuoteDraft(prev => {
      let changed = false;
      const next = { ...prev };
      for (const c of candidates) {
        if (!(c.driverId in next)) { next[c.driverId] = c.quoteAmount ?? 0; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [candidates]);

  const quoteOf = (c: MatchCandidate) => quoteDraft[c.driverId] ?? c.quoteAmount ?? 0;
  // Cheapest quote among the raised-hand drivers with a real (>0) quote.
  const bestQuote = Math.min(...raisedHands.map(quoteOf).filter(q => q > 0), Infinity);
  const isAssigned = !!assignedDriverId;
  const assignedLabel = driverName(assignedDriverId);
  const manualDriver = allDrivers.find(d => d.id === manualDriverId);

  const doAssign = async (driverId: string, name: string, quote?: number) => {
    const by = user ? { id: user.id, name: user.name } : undefined;
    try {
      if (isAssigned) await apiService.reassignDriver(loadId, driverId, false, by);
      else await apiService.assignDriver(loadId, driverId, false, by);
      // Record the agreed driver quote on the load (flows into the Offered column).
      if (quote != null && quote > 0) await updatePricing(loadId, { offeredAmount: quote });
      await unlockDriver(driverId); // assignment supersedes the lock
      message.success(`${name} assigned to ${loadId}${quote ? ` at ₹${quote.toLocaleString()}` : ''}.`);
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
        extra={canAssign && (
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
          description={
            <span className="kkp-text-drab" style={{ fontSize: 12 }}>
              Pick another driver below to change, or unassign to cancel the match.
              {canSeeAssignedBy && load.assignedByName && (
                <><br /><strong>Assigned by {load.assignedByName}</strong>{load.assignedAt ? ` · ${new Date(load.assignedAt).toLocaleString('en-GB')}` : ''}</>
              )}
            </span>
          }
          action={canAssign && (
            <Popconfirm title={`Unassign ${assignedLabel} from ${load.id}?`} okText="Unassign" onConfirm={handleUnassign}>
              <Button size="small" danger icon={<CloseOutlined />}>Unassign</Button>
            </Popconfirm>
          )}
        />
      )}

      {raisedHands.length === 0 ? (
        <Card className="kkp-card">
          <Empty description={loading ? 'Loading…' : 'No drivers have raised their hands for this load yet.'}>
            {canAssign && (
              <GoldButton icon={<UserAddOutlined />} onClick={() => { setManualDriverId(undefined); setManualOpen(true); }}>
                Add driver manually
              </GoldButton>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {raisedHands.map(c => {
            const isBest = quoteOf(c) > 0 && quoteOf(c) === bestQuote;
            const lock = locks[c.driverId];
            const lockedByOther = !!lock && lock.agentId !== user?.id;
            const lockedByMe = !!lock && lock.agentId === user?.id;
            const editing = !!editingQuote[c.driverId];
            const toggleLock = async () => {
              if (lockedByMe) {
                await unlockDriver(c.driverId);
              } else if (user) {
                await lockDriver(c.driverId, { agentId: user.id, agentName: user.name, loadId, at: new Date().toISOString() });
                // Hide phone for everyone — clear any revealed state
                setShownPhones(prev => { const n = { ...prev }; delete n[c.driverId]; return n; });
                message.success(`You locked ${c.name}. Phone number is now hidden from all agents.`);
              }
            };
            return (
              <Col xs={24} sm={12} lg={8} key={c.driverId}>
                <div style={{ border: `1px solid ${lockedByOther ? '#D0D5DD' : lockedByMe ? '#0B4C8C' : isBest ? '#12B76A' : '#E4E7EC'}`, borderRadius: 10, padding: 12, background: lockedByOther ? '#F2F4F7' : '#FFFFFF' }}>
                  <div className="kkp-items-center kkp-gap-8 kkp-mb-8">
                    <Avatar size={36} style={{ backgroundColor: lockedByOther ? '#98A2B3' : '#0B4C8C', color: '#FFFFFF', fontWeight: 700 }}>{c.name.charAt(0)}</Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong className="kkp-text-dark" style={{ display: 'block', fontSize: 14 }}>{c.name}</Text>
                      {/* Vehicle · region · phone/lock — all on one line so the card stays compact. */}
                      <div style={{ fontSize: 11, color: '#667085', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.vehicleType} · {c.region}
                        {!lock && (
                          shownPhones[c.driverId]
                            ? <span className="kkp-text-navy kkp-weight-600"> · <PhoneOutlined /> {c.phone || '—'}</span>
                            : <Button type="link" size="small" icon={<PhoneOutlined />} style={{ padding: '0 0 0 4px', height: 'auto', fontSize: 11 }} onClick={() => setShownPhones(prev => ({ ...prev, [c.driverId]: true }))}>Show number</Button>
                        )}
                        {lock && (
                          <span style={{ color: '#98A2B3' }}> · <LockOutlined /> Number hidden</span>
                        )}
                      </div>
                    </div>
                    <div className="kkp-items-center kkp-gap-8">
                      <Button
                        size="small"
                        type={lockedByMe ? 'primary' : 'default'}
                        icon={lockedByMe ? <UnlockOutlined /> : <LockOutlined />}
                        disabled={!canAssign || lockedByOther}
                        onClick={toggleLock}
                        style={{ borderRadius: 8, fontWeight: 600, ...(lockedByMe ? { background: '#0B4C8C', borderColor: '#0B4C8C' } : {}) }}
                      >
                        {lockedByOther ? 'Locked' : lockedByMe ? 'Unlock' : 'Lock'}
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        disabled={!canAssign || lockedByOther}
                        onClick={() => setEditingQuote(prev => ({ ...prev, [c.driverId]: !prev[c.driverId] }))}
                        style={{ borderRadius: 8, fontWeight: 600 }}
                      >
                        {editing ? 'Done' : 'Edit Quote'}
                      </Button>
                    </div>
                  </div>

                  {/* Quote — read-only until "Edit Quote" */}
                  <div className="kkp-flex-between kkp-items-center kkp-mb-4">
                    <Text className="kkp-text-drab" style={{ fontSize: 11 }}>
                      <ThunderboltOutlined /> {c.engaged === 'quote' ? 'Quoted amount' : 'Raised hand — set quote'}
                    </Text>
                    {isBest && <Tag color="green" style={{ margin: 0, fontSize: 9 }}>Best price</Tag>}
                  </div>
                  <div className="kkp-mb-8">
                    {editing ? (
                      <InputNumber
                        size="small"
                        prefix="₹"
                        min={0}
                        controls={false}
                        autoFocus
                        style={{ width: '100%' }}
                        value={quoteOf(c)}
                        formatter={(v: any) => (v == null || v === '' ? '' : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                        parser={(v: any) => (v ? Number(String(v).replace(/[^\d]/g, '')) : 0) as any}
                        onChange={(v) => setQuoteDraft(prev => ({ ...prev, [c.driverId]: Number(v) || 0 }))}
                      />
                    ) : (
                      <div style={{ border: '1px solid #E4E7EC', borderRadius: 8, padding: '5px 11px', background: '#FFFFFF', fontWeight: 600, color: '#101828' }}>
                        ₹ {quoteOf(c).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {c.isAssigned ? (
                    <Tag color="green" style={{ width: '100%', textAlign: 'center', margin: 0, padding: '4px 0', borderRadius: 8 }}>Assigned to this load</Tag>
                  ) : lockedByOther ? (
                    <div style={{ background: '#EAECF0', border: '1px solid #D0D5DD', borderRadius: 8, padding: '6px 8px', fontSize: 11, color: '#475467' }}>
                      <LockOutlined /> Agent <strong>{lock!.agentName}</strong> locked this driver — contact another driver
                    </div>
                  ) : (
                    <GoldButton icon={isAssigned ? <SwapOutlined /> : <CheckOutlined />} style={{ width: '100%' }} disabled={!canAssign} onClick={() => setConfirm(c)}>
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
        onOk={() => confirm && doAssign(confirm.driverId, confirm.name, quoteOf(confirm))}
        title={<span className="kkp-text-dark">{isAssigned ? 'Confirm Driver Change' : 'Confirm Assignment'}</span>}
        okText={isAssigned ? 'Change driver' : 'Assign'}
        okButtonProps={{ style: { background: '#0B4C8C', border: 'none', color: '#FFFFFF', fontWeight: 700 } }}
      >
        {confirm && (
          <p className="kkp-text-muted">
            {isAssigned ? 'Change' : 'Assign'} load <strong className="kkp-text-navy">{load.id}</strong> to{' '}
            <strong className="kkp-text-dark">{confirm.name}</strong>
            {quoteOf(confirm) > 0 && <> at an agreed quote of <strong className="kkp-text-dark">₹{quoteOf(confirm).toLocaleString()}</strong></>}?
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
              label: `${d.name} · ${d.id} · ${d.vehicleType} · ${busy ? `with ${busy.assignedByName || 'another agent'} on ${busy.id}` : d.status.replace('_', ' ')}`,
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
