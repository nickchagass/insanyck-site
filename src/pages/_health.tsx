// [DEV] Health check page - only available in development
import { GetServerSideProps } from 'next';

export default function HealthPage() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>INSANYCK Health Check</h1>
      <p>Status: OK</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return { notFound: true };
  }
  
  return { props: {} };
};