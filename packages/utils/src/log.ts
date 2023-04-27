import log from 'npmlog';

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

log.heading = 'devlink';
log.addLevel('success', 2000, { fg: 'green', bold: true });
log.addLevel('notice', 2000, { fg: 'blue', bg: 'black' });

export default log;
