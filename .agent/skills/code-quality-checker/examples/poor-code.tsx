import { Typography } from 'antd';
const { Title, Text } = Typography;

// ❌ BAD PRACTICE (Trigger for the Quality Checker)
// 1. Uses AntD Typography (generates CSS-in-JS noise)
// 2. Heavy use of inline styles style={{...}}
// 3. Hardcoded colors (#fff, blue, #666) instead of CSS vars
// 4. Inconsistent typography hierarchy

export default function PoorCard() {
    return (
        <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
            <Title level={4} style={{ color: 'blue', margin: 0 }}>Basic Title</Title>
            <Text style={{ fontSize: '14px', color: '#666' }}>This is some description text.</Text>
            
            <div style={{ marginTop: '12px' }}>
               <span style={{ background: 'red', color: 'white', padding: '2px 4px', fontSize: '10px' }}>
                   Error
                </span>
            </div>
        </div>
    );
}
