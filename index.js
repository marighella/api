import app from './lib/app';

app().listen(process.env.API_APP_PORT || 8000);
