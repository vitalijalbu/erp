import { Card, Typography, Space } from 'antd';
const { Title, Text } = Typography;
import { IconAlertCircle, IconBulb } from '@tabler/icons-react';
const HelpBox = () => {

  return (
    <Card title={<Space><IconAlertCircle/><Text strong>Suggestions</Text></Space>}>
  Alert here
</Card>
  );
      
};

export default HelpBox;
