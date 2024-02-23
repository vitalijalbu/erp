import instance from '@/lib/api';

export const getTransactionHistoryReports = async (filters) => {
  try {
    const response = await instance.get('/reports/transaction-history', {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

/* Export EXCEL */
export const exportTransactionHistory = async (filters) => {
  try {
    const response = await instance.get('/reports/transaction-history/export',  {params: filters}, {
      responseType: 'blob', // Set the response type to blob
    });

    // Create a download link
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([response.data]));

    // Set the link attributes and click the link to download the file
    link.setAttribute('download', `transaction-history-report_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};