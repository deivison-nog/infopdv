const { execSync } = require('child_process');

try {
  console.log('🔍 Procurando processo na porta 3000...');
  
  const result = execSync('netstat -ano | findstr :3000').toString();
  const lines = result.split('\n');
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    
    if (pid && !isNaN(pid) && pid !== '0') {
      console.log(`💀 Matando processo PID: ${pid}`);
      execSync(`taskkill /PID ${pid} /F`);
    }
  });
  
  console.log('✅ Porta 3000 liberada!\n');
} catch (error) {
  console.log('ℹ️  Nenhum processo encontrado na porta 3000\n');
}