const useOpenConsoleWindow = function() {
    if(!window.popUpWindow) {
        const newWindow = window.open(
            "/widgets/console",
            "erp_console",
            "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=800px,height=800px"
        );
        if (newWindow) {
            newWindow.focus(); // Set focus on the new window
            window.popUpWindow = newWindow;
            newWindow.addEventListener('unload', function() {
                if(this.location.origin != null && this.location.origin != 'null') {
                    window.popUpWindow = null;
                }
            });
        } else {
            console.error("Failed to open resizable window.");
        }
    }
    else {
        window.popUpWindow.focus();
    }
}

export default useOpenConsoleWindow;