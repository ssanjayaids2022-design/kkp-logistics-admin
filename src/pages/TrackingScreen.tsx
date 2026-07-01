import React, { useState } from 'react';
import { Card as AntdCard, Row, Col, Empty, Typography, Avatar, Tag, Progress, Badge, Button, message } from 'antd';
const Card = AntdCard as any;
import { EnvironmentOutlined, PhoneOutlined, DashboardOutlined, ClockCircleOutlined, AimOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import StatusTag from '../components/StatusTag';
import { useLoads } from '../context/LoadsContext';
import { apiService } from '../services/apiService';
import type { Driver, Load } from '../types';

const { Text } = Typography;

// Loads currently on the road (assigned + moving).
const EN_ROUTE = ['in_transit', 'delayed'];
const isEnRoute = (l: Load) => !!l.assignedDriver && EN_ROUTE.includes(l.status);

// Approx coordinates for the cities used in the sample data (SIM feed is simulated).
const CITY: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.877], Delhi: [28.704, 77.102], Chennai: [13.083, 80.270], Bangalore: [12.972, 77.594],
  Kolkata: [22.573, 88.364], Guwahati: [26.145, 91.736], Hyderabad: [17.385, 78.487], Pune: [18.520, 73.857],
  Ahmedabad: [23.023, 72.571], Jaipur: [26.912, 75.787], Lucknow: [26.847, 80.947], Patna: [25.594, 85.138],
  Surat: [21.170, 72.831], Nagpur: [21.146, 79.088], Coimbatore: [11.017, 76.956], Kochi: [9.932, 76.267],
  Chandigarh: [30.733, 76.780], Goa: [15.300, 74.124], Indore: [22.720, 75.858], Bhopal: [23.260, 77.413],
  Visakhapatnam: [17.687, 83.219], Vijayawada: [16.507, 80.648], Kanpur: [26.450, 80.332], Varanasi: [25.317, 82.973],
  Rajkot: [22.303, 70.802], Mysore: [12.295, 76.639], Thiruvananthapuram: [8.524, 76.937], Ludhiana: [30.901, 75.857],
  Ranchi: [23.344, 85.310], Bhubaneswar: [20.296, 85.824],
};

const cityKey = (place: string) => place.split(',')[0].trim();
const coordsOf = (place: string): [number, number] => CITY[cityKey(place)] || [20.5937, 78.9629]; // fallback: centre of India
const parseKm = (d?: string) => (d ? Number(d.replace(/[^\d.]/g, '')) || 0 : 0);
const hash = (s: string) => Math.abs(s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0));

export default function TrackingScreen() {
  const { loads } = useLoads();
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    apiService.fetchDrivers().then(setAllDrivers).catch(() => setAllDrivers([]));
  }, []);

  // Drive the simulated SIM feed — a fresh "ping" every second.
  React.useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const tracked = loads.filter(isEnRoute);

  const driverOf = (l: Load) =>
    allDrivers.find(d => d.id === l.assignedDriver || d.name === l.assignedDriver);

  // Simulated position for a load: creeps forward over time from a stable base.
  const sim = (l: Load) => {
    const h = hash(l.id);
    const base = 8 + (h % 62);                 // stable start 8–70%
    const pct = Math.min(98, base + tick * (0.08 + (h % 7) / 100)); // creeps forward
    const p = pct / 100;
    const [sLat, sLng] = coordsOf(l.source);
    const [dLat, dLng] = coordsOf(l.destination);
    const lat = sLat + (dLat - sLat) * p;
    const lng = sLng + (dLng - sLng) * p;
    const totalKm = parseKm(l.distance);
    const remainingKm = Math.round(totalKm * (1 - p));
    const speed = 42 + (h % 20);               // 42–61 km/h
    const etaHrs = speed > 0 ? remainingKm / speed : 0;
    const consent = h % 6 === 0 ? 'pending' : 'active';
    const seg = p < 0.12 ? `Departing ${cityKey(l.source)}` : p > 0.88 ? `Approaching ${cityKey(l.destination)}` : `En route to ${cityKey(l.destination)}`;
    return { pct: Math.round(pct), lat, lng, totalKm, remainingKm, speed, etaHrs, consent, seg, pingSec: tick % 3 };
  };

  return (
    <div>
      <PageHeader
        title="Live Tracking"
        subtitle={`${tracked.length} vehicle${tracked.length === 1 ? '' : 's'} on the road · SIM-based location (simulated)`}
      />

      {tracked.length === 0 ? (
        <Card className="kkp-card"><Empty description="No vehicles are on the road right now." /></Card>
      ) : (
        <Row gutter={[12, 12]}>
          {tracked.map(load => {
            const d = driverOf(load);
            const s = sim(load);
            const pending = s.consent === 'pending';
            return (
              <Col xs={24} lg={12} key={load.id}>
                <Card className="kkp-card" styles={{ body: { padding: 16 } }}>
                  {/* Header */}
                  <div className="kkp-flex-between kkp-items-center kkp-mb-12" style={{ flexWrap: 'wrap', gap: 8 }}>
                    <span className="kkp-items-center kkp-gap-8" style={{ flexWrap: 'wrap' }}>
                      <span className="kkp-text-gold kkp-weight-700">{load.id}</span>
                      <span className="kkp-text-dark kkp-weight-600">{cityKey(load.source)} → {cityKey(load.destination)}</span>
                      <StatusTag status={load.status as any} />
                    </span>
                    {pending
                      ? <Tag color="orange" style={{ margin: 0 }}>SIM consent pending</Tag>
                      : <Badge status="processing" text={<span className="kkp-text-drab" style={{ fontSize: 12 }}>LIVE</span>} />}
                  </div>

                  {/* Driver */}
                  <div className="kkp-items-center kkp-gap-8 kkp-mb-12">
                    <Avatar size={36} style={{ backgroundColor: '#0B4C8C', color: '#FFFFFF', fontWeight: 700 }}>
                      {(d?.name || String(load.assignedDriver)).charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong className="kkp-text-dark" style={{ display: 'block', fontSize: 14 }}>{d?.name || load.assignedDriver}</Text>
                      <Text className="kkp-text-drab" style={{ fontSize: 12 }}><PhoneOutlined /> {d?.phone || '—'} · {load.vehicleType}</Text>
                    </div>
                  </div>

                  {pending ? (
                    <div style={{ background: '#FFFAEB', border: '1px solid #FEDF89', borderRadius: 10, padding: 12 }}>
                      <Text className="kkp-text-dark" style={{ fontSize: 13 }}>
                        Waiting for the driver to approve SIM location sharing on their phone.
                      </Text>
                      <div style={{ marginTop: 10 }}>
                        <Button size="small" icon={<ReloadOutlined />} onClick={() => message.info(`SIM consent request re-sent to ${d?.name || load.assignedDriver}.`)}>
                          Re-send consent request
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Location readout */}
                      <Row gutter={[8, 8]} className="kkp-mb-12">
                        <Col span={12}>
                          <Text className="kkp-text-drab" style={{ fontSize: 11, display: 'block' }}><AimOutlined /> CURRENT LOCATION</Text>
                          <Text className="kkp-text-dark" style={{ fontSize: 13, fontWeight: 600 }}>{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</Text>
                          <Text className="kkp-text-drab" style={{ fontSize: 11, display: 'block' }}>{s.seg}</Text>
                        </Col>
                        <Col span={6}>
                          <Text className="kkp-text-drab" style={{ fontSize: 11, display: 'block' }}><DashboardOutlined /> SPEED</Text>
                          <Text className="kkp-text-dark" style={{ fontSize: 13, fontWeight: 600 }}>{s.speed} km/h</Text>
                        </Col>
                        <Col span={6}>
                          <Text className="kkp-text-drab" style={{ fontSize: 11, display: 'block' }}><ClockCircleOutlined /> ETA</Text>
                          <Text className="kkp-text-dark" style={{ fontSize: 13, fontWeight: 600 }}>
                            {s.etaHrs < 1 ? `${Math.round(s.etaHrs * 60)} min` : `${s.etaHrs.toFixed(1)} hrs`}
                          </Text>
                        </Col>
                      </Row>

                      {/* Progress along route */}
                      <Progress percent={s.pct} size="small" strokeColor="#0B4C8C" />
                      <div className="kkp-flex-between">
                        <Text className="kkp-text-drab" style={{ fontSize: 11 }}><EnvironmentOutlined /> {cityKey(load.source)}</Text>
                        <Text className="kkp-text-drab" style={{ fontSize: 11 }}>
                          {s.totalKm - s.remainingKm} / {s.totalKm} km · {s.remainingKm} km left
                        </Text>
                        <Text className="kkp-text-drab" style={{ fontSize: 11 }}>{cityKey(load.destination)} <EnvironmentOutlined /></Text>
                      </div>
                      <Text className="kkp-text-drab" style={{ fontSize: 10, display: 'block', marginTop: 6 }}>
                        Last SIM ping {s.pingSec}s ago
                      </Text>
                    </>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
