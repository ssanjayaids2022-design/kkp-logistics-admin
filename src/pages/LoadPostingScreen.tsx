import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Card as AntdCard, Row, Col, message, Radio } from 'antd';
const Card = AntdCard as any;
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoldButton from '../components/GoldButton';
import { vehicleTypes, indianCities } from '../data/mockData';
import { useLoads } from '../context/LoadsContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Modal, Button } from 'antd';
import { useAuth } from '../context/AuthContext';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const { TextArea } = Input;
const { Option } = Select;

export default function LoadPostingScreen() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { addLoad } = useLoads();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const { user } = useAuth();

  const isChairman = user?.role === 'CHAIRMAN';

  const onFinish = (values: any) => {
    const calculatedBudget = values.priceType === 'per_ton'
      ? (values.ratePerTon * values.weight)
      : values.fixedAmount;

    const newLoad = addLoad({
      source: values.source,
      destination: values.destination,
      pickupDate: values.pickupDate.format('DD/MM/YYYY'), // Format dayjs to string
      vehicleType: values.vehicleType,
      weight: values.weight,
      budget: calculatedBudget,
      priceType: values.priceType,
      ratePerTon: values.priceType === 'per_ton' ? values.ratePerTon : undefined,
      fixedAmount: values.priceType === 'fixed' ? values.fixedAmount : undefined,
    } as any);

    addNotification({
      title: 'Load Posted Successfully',
      message: `Load ${newLoad.id} (${newLoad.source} → ${newLoad.destination}) is now live for bidding.`,
      type: 'load',
    });

    message.success(t('postLoad.success') || `Load posted successfully! ID: ${newLoad.id}`);
    form.resetFields();
    
    // Navigate to load list to show it "need to show"
    setTimeout(() => {
      navigate('/loads');
    }, 1000);
  };

  const cityOptions = indianCities.map(city => ({ value: city, label: city }));

  const [mapVisible, setMapVisible] = React.useState(false);
  const [activeField, setActiveField] = React.useState<'source' | 'destination' | null>(null);
  const [tempPos, setTempPos] = React.useState<[number, number]>([20.5937, 78.9629]); // India center

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setTempPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={tempPos} />;
  };

  const handleMapConfirm = () => {
    if (activeField) {
      // For demo purposes, we just set a mock address string
      const mockAddr = `Pin [${tempPos[0].toFixed(4)}, ${tempPos[1].toFixed(4)}]`;
      form.setFieldsValue({ [activeField]: mockAddr });
    }
    setMapVisible(false);
  };

  const openMap = (field: 'source' | 'destination') => {
    setActiveField(field);
    setMapVisible(true);
  };

  return (
    <div>
      <PageHeader
        title={t('postLoad.title')}
        subtitle={t('postLoad.subtitle')}
      />

      <Card className="kkp-card" style={{ maxWidth: 800 }}>
        {isChairman && (
          <div style={{ background: '#FFF2E8', border: '1px solid #FFC069', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
            <span style={{ color: '#D46B08', fontWeight: 600 }}>⚠️ Read-Only Mode:</span> As Chairman, you have auditor access and cannot submit or edit load postings.
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark="optional"
          disabled={isChairman}
        >
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="source"
                label={
                  <div className="kkp-flex-between" style={{ width: '100%' }}>
                    <span className="kkp-text-muted kkp-weight-600">{t('postLoad.source')}</span>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EnvironmentOutlined />} 
                      onClick={() => openMap('source')}
                      className="kkp-text-navy"
                      style={{ padding: 0, height: 'auto', fontWeight: 700 }}
                      disabled={isChairman}
                    >
                      Map
                    </Button>
                  </div>
                }
                rules={[{ required: true, message: t('postLoad.selectSource') }]}
              >
                <Select
                  showSearch
                  placeholder={t('postLoad.selectSource')}
                  options={cityOptions}
                  suffixIcon={<EnvironmentOutlined style={{ color: '#0B4C8C' }} />}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="destination"
                label={
                  <div className="kkp-flex-between" style={{ width: '100%' }}>
                    <span className="kkp-text-muted kkp-weight-600">{t('postLoad.destination')}</span>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EnvironmentOutlined />} 
                      onClick={() => openMap('destination')}
                      className="kkp-text-navy"
                      style={{ padding: 0, height: 'auto', fontWeight: 700 }}
                      disabled={isChairman}
                    >
                      Map
                    </Button>
                  </div>
                }
                rules={[{ required: true, message: t('postLoad.selectDest') }]}
              >
                <Select
                  showSearch
                  placeholder={t('postLoad.selectDest')}
                  options={cityOptions}
                  suffixIcon={<EnvironmentOutlined style={{ color: '#0B4C8C' }} />}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="pickupDate"
                label={<span className="kkp-text-muted kkp-weight-600">{t('postLoad.pickupDate')}</span>}
                rules={[{ required: true, message: t('postLoad.pickupDate') }]}
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: 8 }}
                  suffixIcon={<CalendarOutlined style={{ color: '#0B4C8C' }} />}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="vehicleType"
                label={<span className="kkp-text-muted kkp-weight-600">{t('postLoad.vehicleType')}</span>}
                rules={[{ required: true, message: t('postLoad.selectVehicle') }]}
              >
                <Select 
                  placeholder={t('postLoad.selectVehicle')} 
                  className="kkp-btn-rounded"
                  options={vehicleTypes.map(v => ({ value: v, label: v }))} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="weight"
                label={<span className="kkp-text-muted kkp-weight-600">{t('postLoad.weight')}</span>}
                rules={[{ required: true, message: t('postLoad.weight') || 'Please input weight' }]}
              >
                <InputNumber
                  min={0.1}
                  max={100}
                  step={0.1}
                  placeholder="e.g. 5.5"
                  style={{ width: '100%', borderRadius: 8 }}
                  suffix={<span style={{ color: '#667085', paddingRight: 8 }}>Ton</span>}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="priceType"
                label={<span className="kkp-text-muted kkp-weight-600">Price Option</span>}
                initialValue="fixed"
              >
                <Radio.Group 
                  optionType="button" 
                  buttonStyle="solid" 
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="fixed" style={{ width: '50%', textAlign: 'center' }}>Fixed Price</Radio.Button>
                  <Radio.Button value="per_ton" style={{ width: '50%', textAlign: 'center' }}>Price per Ton</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.priceType !== currentValues.priceType ||
              prevValues.weight !== currentValues.weight
            }
          >
            {({ getFieldValue }) => {
              const priceType = getFieldValue('priceType') || 'fixed';
              const weight = getFieldValue('weight') || 0;
              
              if (priceType === 'fixed') {
                return (
                  <Row gutter={20}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fixedAmount"
                        label={<span className="kkp-text-muted kkp-weight-600">Fixed Price Amount (₹)</span>}
                        rules={[{ required: true, message: 'Please input fixed price amount' }]}
                      >
                        <InputNumber
                          min={1000}
                          max={500000}
                          placeholder="e.g. 45000"
                          style={{ width: '100%', borderRadius: 8 }}
                          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/₹\s?|(,*)/g, '') as any}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              } else {
                return (
                  <Row gutter={20}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="ratePerTon"
                        label={<span className="kkp-text-muted kkp-weight-600">Rate per Ton (₹/Ton)</span>}
                        rules={[{ required: true, message: 'Please input rate per ton' }]}
                      >
                        <InputNumber
                          min={100}
                          max={50000}
                          placeholder="e.g. 1500"
                          style={{ width: '100%', borderRadius: 8 }}
                          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/₹\s?|(,*)/g, '') as any}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="kkp-text-muted kkp-weight-600">Estimated Total (Calculated)</span>}
                      >
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.ratePerTon !== currentValues.ratePerTon}>
                          {() => {
                            const rate = getFieldValue('ratePerTon') || 0;
                            const total = rate * weight;
                            return (
                              <div style={{
                                height: 40,
                                lineHeight: '38px',
                                padding: '0 12px',
                                background: '#F9FAFB',
                                border: '1px solid #D0D5DD',
                                borderRadius: 8,
                                fontWeight: 700,
                                color: '#0B4C8C',
                                fontSize: 15
                              }}>
                                ₹ {total.toLocaleString('en-IN')}
                              </div>
                            );
                          }}
                        </Form.Item>
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }
            }}
          </Form.Item>

          <Form.Item
            name="notes"
            label={<span className="kkp-text-muted kkp-weight-600">{t('postLoad.notes')}</span>}
          >
            <TextArea
              rows={4}
              placeholder="..."
              style={{ borderRadius: 8, background: '#FFFFFF', borderColor: '#E4E7EC' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <GoldButton
              htmlType="submit"
              size="large"
              className="kkp-btn-rounded kkp-weight-700"
              style={{ height: 48, paddingInline: 40, fontSize: 15 }}
            >
              {t('postLoad.submit')}
            </GoldButton>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={t('common.setMap') || "Select Location on Map"}
        open={mapVisible}
        onCancel={() => setMapVisible(false)}
        onOk={handleMapConfirm}
        width={700}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: 400, width: '100%', position: 'relative' }}>
          <MapContainer center={tempPos} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
          <div style={{ 
            position: 'absolute', 
            bottom: 10, 
            left: 10, 
            zIndex: 1000, 
            background: 'rgba(0,0,0,0.7)', 
            padding: '4px 10px', 
            borderRadius: 4, 
            color: '#fff',
            fontSize: 12
          }}>
            Click anywhere on map to select location
          </div>
        </div>
      </Modal>
    </div>
  );
}
