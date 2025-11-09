import { FiDownload, FiCalendar } from 'react-icons/fi';
import { PageHeader, StandardButton } from '@/components/common';

interface AnalyticsHeaderProps {
  onExport?: () => void;
  onDateRangeChange?: () => void;
  dateRangeLabel?: string;
}

const AnalyticsHeader = ({ onExport, onDateRangeChange, dateRangeLabel = 'Last 30 Days' }: AnalyticsHeaderProps) => {
  return (
    <PageHeader
      title="Analytics"
      description="Track your sales performance and business insights"
      actions={
        <>
          <StandardButton
            variant="secondary"
            onClick={onDateRangeChange}
            leftIcon={<FiCalendar />}
          >
            {dateRangeLabel}
          </StandardButton>
          <StandardButton
            variant="primary"
            onClick={onExport}
            leftIcon={<FiDownload />}
          >
            Export Report
          </StandardButton>
        </>
      }
    />
  );
};

export default AnalyticsHeader;
