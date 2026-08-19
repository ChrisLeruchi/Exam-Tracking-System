import app from '../src/app.js'

export default function handler(req, res) {
	// Vercel can strip /api from the function URL before Express receives it.
	// The application routes are mounted with the /api prefix.
	if (!req.url.startsWith('/api')) {
		req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`
	}

	return app(req, res)
}
