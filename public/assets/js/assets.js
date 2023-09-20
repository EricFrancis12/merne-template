

(function () {
    const scripts = [
        '/assets/js/header.js',
        '/assets/js/footer.js',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11'
    ];

    const stylesheets = [];



    scripts.forEach(script => {
        const scriptTag = document.createElement('script');
        scriptTag.src = script;
        document.head.appendChild(scriptTag);
    });

    stylesheets.forEach(stylesheet => {
        const linkTag = document.createElement('link');
        linkTag.rel = 'stylesheet';
        linkTag.href = stylesheet;
        document.head.appendChild(linkTag);
    });
})();
