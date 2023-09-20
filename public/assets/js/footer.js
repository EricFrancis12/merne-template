

(function () {
    const links = [
        '/',
        '/app',
        '/register',
        '/register/resend',
        '/login',
        '/reset-password'
    ];

    const footerHtml = `
        <footer class="absolute bottom-0 flex flex-wrap justify-center items-center gap-4 w-full mb-4">
            ${links.map(link => `<a class="border border-black rounded-lg p-1 hover:text-blue-500" href="${link}">${link}</a>`).join('')}
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHtml);
})();
