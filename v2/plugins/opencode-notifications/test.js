import notifier from 'node-notifier';

console.log('Testing OpenCode Notifications plugin...');

notifier.notify({
  title: 'OpenCode Notifications',
  message: 'Plugin is working! You should see this notification.',
  sound: true,
  wait: false,
  timeout: 5
}, (err, response) => {
  if (err) {
    console.error('❌ Notification failed:', err);
  } else {
    console.log('✓ Notification sent successfully!');
    console.log('Response:', response);
  }
});

console.log('✓ Test notification triggered. Check your desktop for the notification!');
