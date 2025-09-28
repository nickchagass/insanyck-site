const fs = require('fs');
const path = require('path');

const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.json', '.md', '.env', '.mjs'];
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'out'];
const output = [];

function readDirectory(dirPath, level = 0) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(item) && !item.startsWith('.')) {
                output.push(`${'  '.repeat(level)}📁 ${item}/`);
                readDirectory(fullPath, level + 1);
            }
        } else if (extensions.some(ext => item.endsWith(ext))) {
            output.push(`${'  '.repeat(level)}📄 ${item}`);
            
            // Adiciona o conteúdo do arquivo
            output.push('\n' + '='.repeat(60));
            output.push(`FILE: ${fullPath}`);
            output.push('='.repeat(60));
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                output.push(content);
            } catch (err) {
                output.push(`[Erro ao ler arquivo: ${err.message}]`);
            }
            output.push('\n');
        }
    });
}

console.log('🔍 Analisando estrutura do projeto INSANYCK...\n');
output.push('# ESTRUTURA DO PROJETO INSANYCK\n');
readDirectory('./');

// Salva tudo em um arquivo
fs.writeFileSync('analise_insanyck.txt', output.join('\n'));
console.log('✅ Arquivo "analise_insanyck.txt" criado com sucesso!');
console.log('📤 Agora envie este arquivo para o Claude fazer a análise completa.');