const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');

// Novas chaves com permissões corretas
const pinata = new pinataSDK('b6e4d68aaffd27e2f654', 'b9c559ba0dabb693dcd08ce0cda8f384379bd9881834199f406571a1d610aa0e');

// Pasta com o site estático
const sourcePath = path.join(__dirname, 'app/out');

const options = {
    pinataMetadata: {
        name: 'KatrinaDEX-v1',
    },
    pinataOptions: {
        cidVersion: 0
    }
};

console.log('🚀 Iniciando upload para o IPFS via Pinata...');
console.log('📁 Enviando pasta:', sourcePath);
console.log('Aguarde...\n');

pinata.pinFromFS(sourcePath, options).then((result) => {
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ UPLOAD CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('🔗 Hash IPFS (CID):', result.IpfsHash);
    console.log('');
    console.log('📝 Para o ENS, use:');
    console.log(`   ipfs://${result.IpfsHash}`);
    console.log('');
    console.log('🌐 Teste no navegador:');
    console.log(`   https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`   https://ipfs.io/ipfs/${result.IpfsHash}`);
    console.log(`   https://cloudflare-ipfs.com/ipfs/${result.IpfsHash}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════');
}).catch((err) => {
    console.error('❌ Erro no upload:', err);
});
