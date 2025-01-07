// Download file
const useExport = (data, filename) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([data]));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}


// Open in Browser PDF
const useOpenInBrowser = (data, fileName) => {
    // Create a Blob with the data
    const blob = new Blob([data], { type: 'application/pdf' });
  
    // Create a custom filename for the Blob URL
    const objectURL = URL.createObjectURL(blob, { type: 'application/pdf' });
  
    // Open the Blob URL in a new window
    const openedWindow = window.open(objectURL, '_blank');
    openedWindow.document.title = fileName;
  
    if (openedWindow) {
      // Revoke the Blob URL when the window is closed
      openedWindow.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(objectURL);
      });
    }
  };
  

export  { useExport, useOpenInBrowser };