import app from './app';
import { scheduleBackups } from './services/backupService';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleBackups();
});
