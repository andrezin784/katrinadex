const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

const API_KEY = 'b6e4d68aaffd27e2f654';
const SECRET_KEY = 'b9c559ba0dabb693dcd08ce0cda8f384379bd9881834199f406571a1d610aa0e';
const OUT_DIR = path.join(__dirname, 'app/out');

// Função para coletar todos os arquivos recursivamente
function getAllFiles(dirPath, arrayOfFiles = [], basePath = '') {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.join(basePath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles, relativePath);
        } else {
            arrayOfFiles.push({
                fullPath,
                relativePath: relativePath.replace(/\\/g, '/')
            });
        }
    });
    
    return arrayOfFiles;
}

async function uploadToPinata() {
    console.log('🚀 Preparando upload para o Pinata...\n');
    
    const allFiles = getAllFiles(OUT_DIR);
    console.log(`📁 Encontrados ${allFiles.length} arquivos para upload\n`);
    
    const form = new FormData();
    
    // Adicionar cada arquivo ao form
    allFiles.forEach(({ fullPath, relativePath }) => {
        form.append('file', fs.createReadStream(fullPath), {
            filepath: `katrinadex/${relativePath}`
        });
    });
    
    // Metadata
    form.append('pinataMetadata', JSON.stringify({
        name: 'KatrinaDEX-Site-v1'
    }));
    
    form.append('pinataOptions', JSON.stringify({
        cidVersion: 0,
        wrapWithDirectory: false
    }));
    
    console.log('📤 Enviando para o IPFS...\n');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pinata.cloud',
            port: 443,
            path: '/pinning/pinFileToIPFS',
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                'pinata_api_key': API_KEY,
                'pinata_secret_api_key': SECRET_KEY
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.IpfsHash) {
                        console.log('═══════════════════════════════════════════════════════════');
                        console.log('✅ UPLOAD CONCLUÍDO COM SUCESSO!');
                        console.log('═══════════════════════════════════════════════════════════');
                        console.log('');
                        console.log('🔗 Hash IPFS (CID):', result.IpfsHash);
                        console.log('');
                        console.log('📝 Para configurar no ENS, use:');
                        console.log(`   ipfs://${result.IpfsHash}`);
                        console.log('');
                        console.log('🌐 Teste no navegador:');
                        console.log(`   https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
                        console.log(`   https://${result.IpfsHash}.ipfs.dweb.link`);
                        console.log('');
                        console.log('═══════════════════════════════════════════════════════════');
                        resolve(result);
                    } else {
                        console.error('❌ Resposta inesperada:', data);
                        reject(new Error(data));
                    }
                } catch (e) {
                    console.error('❌ Erro ao processar resposta:', data);
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        form.pipe(req);
    });
}

uploadToPinata().catch(console.error);



