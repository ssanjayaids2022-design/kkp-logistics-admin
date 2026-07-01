import React, { useState } from 'react';
import { Card as AntdCard, Row, Col, Select, Tag, Empty, Typography, Avatar } from 'antd';
const Card = AntdCard as any;
import { RightOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusTag from '../components/StatusTag';
import { useLoads } from '../context/LoadsContext';
import { apiService, type MatchCandidate } from '../services/apiService';
import type { Driver, Load } from '../types';

const { Text } = Typography;

const CLOSED = ['delivered', 'completed', 'cancelled'];
const needsDriver = (l: Load) => !l.assignedDriver && !CLOSED.includes(l.status);
const isAssignedLoad = (l: Load) => !!l.assignedDriver && !CLOSED.includes(l.status);

export default function MatchScreen() {
  const navigate = useNavigate();
  const { loads } = useLoads();

  const [candidatesByLoad, setCandidatesByLoad] = useState<Record<string, MatchCandidate[]>>({});
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');

  React.useEffect(() => {
    apiService.fetchDrivers().then(setAllDrivers).catch(() => setAllDrivers([]));
  }, []);

  // Fetch candidates for loads needing a driver — only to show the raise-hand count.
  const loadCounts = React.useCallback(async () => {
    const ids = loads.filter(needsDriver).map(l => l.id);
    if (ids.length === 0) { setCandidatesByLoad({}); return; }
    const results = await Promise.all(ids.map(id =>
      apiService.fetchCandidates(id)
        .then(r => [id, r.candidates] as const)
        .catch(() => [id, [] as MatchCandidate[]] as const)
    ));
    setCandidatesByLoad(Object.fromEntries(results));
  }, [loads]);

  React.useEffect(() => { loadCounts(); }, [loadCounts]);

  const driverName = (x?: string | null) => allDrivers.find(d => d.id === x)?.name || x || '—';
  const handsFor = (loadId: string) => (candidatesByLoad[loadId] || []).filter(c => c.engaged).length;

  const visibleLoads = loads.filter(l =>
    filter === 'unassigned' ? needsDriver(l)
      : filter === 'assigned' ? isAssignedLoad(l)
        : (needsDriver(l) || isAssignedLoad(l))
  );

  return (
    <div>
      <PageHeader
        title="Match Load"
        subtitle={`${visibleLoads.length} load${visibleLoads.length === 1 ? '' : 's'} — open a load to see the drivers who raised their hands`}
      />

      <Row style={{ marginBottom: 20 }}>
        <Col xs={24} sm={10} md={6}>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: '100%' }}
            options={[
              { value: 'unassigned', label: 'Unassigned loads' },
              { value: 'assigned', label: 'Assigned loads' },
              { value: 'all', label: 'All loads' },
            ]}
          />
        </Col>
      </Row>

      {visibleLoads.length === 0 ? (
        <Card className="kkp-card"><Empty description="No loads to show for this filter." /></Card>
      ) : (
        <Row gutter={[12, 12]}>
          {visibleLoads.map(load => {
            const assigned = isAssignedLoad(load);
            const hands = handsFor(load.id);
            return (
              <Col xs={24} key={load.id}>
                <Card
                  className="kkp-card"
                  hoverable
                  styles={{ body: { padding: 16 } }}
                  onClick={() => navigate(`/match/${load.id}`)}
                >
                  <div className="kkp-flex-between kkp-items-center" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <div className="kkp-items-center kkp-gap-12" style={{ flexWrap: 'wrap' }}>
                      <span className="kkp-text-gold kkp-weight-700" style={{ fontSize: 15 }}>{load.id}</span>
                      <span className="kkp-text-dark kkp-weight-600">{load.source} → {load.destination}</span>
                      <Tag style={{ margin: 0 }}>{load.vehicleType}</Tag>
                      <StatusTag status={load.status as any} />
                    </div>

                    <div className="kkp-items-center kkp-gap-12">
                      {assigned ? (
                        <span className="kkp-items-center kkp-gap-8">
                          <Avatar size={26} style={{ backgroundColor: '#12B76A', color: '#FFFFFF', fontWeight: 700, fontSize: 12 }}>
                            {driverName(load.assignedDriver).charAt(0)}
                          </Avatar>
                          <Text className="kkp-text-dark" style={{ fontSize: 13 }}>
                            <UserOutlined /> {driverName(load.assignedDriver)}
                          </Text>
                        </span>
                      ) : (
                        <Tag color={hands > 0 ? 'blue' : 'default'} style={{ margin: 0, fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>
                          <TeamOutlined /> {hands > 0 ? `${hands} raised ${hands === 1 ? 'hand' : 'hands'}` : 'No hands yet'}
                        </Tag>
                      )}
                      <RightOutlined className="kkp-text-drab" />
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
