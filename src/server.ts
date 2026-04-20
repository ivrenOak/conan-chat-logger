import http from 'node:http';
import { saveMessage } from './handleMessage';
import { getSettings } from './settings';

export function startServer() {
    try {
        const server = http.createServer(async (req, res) => {
            const url = new URL(req.url ?? '/', 'http://localhost');
            if (url.pathname !== '/conan') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            if (req.method !== 'GET') {
                res.writeHead(405, { 'Content-Type': 'text/plain', Allow: 'GET' });
                res.end('Method Not Allowed');
                return;
            }
            console.info('Received request', req.url, req.method,req.headers);
            try {
                await saveMessage(url.searchParams.get('sender') ?? undefined, url.searchParams.get('message') ?? undefined);
                res.writeHead(204);
                res.end();
            } catch (error) {
                console.error(error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                return;
            }
        });

        server.listen(getSettings().port, 'localhost', () => {
            console.info(`Server is running on http://localhost:${getSettings().port}/`);
        });
    } catch (error) {
        console.error(error);
    }
}
