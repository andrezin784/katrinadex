const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');

// Suas chaves
const pinata = new pinataSDK('6bc3fb9563ddd5b828ca', 'de05bcd571112da94be0b67366d9828a7244de570f4d0d7ee80ba2602005a60e');

// Apontando para o arquivo ZIP em vez da pasta
const sourcePath = path.join(__dirname, 'app/katrinadex-site.zip');

const options = {
    pinataMetadata: {
        name: 'KatrinaDEX-Site-Zip',
    },
    pinataOptions: {
        cidVersion: 0
    }
};

console.log('🚀 Enviando arquivo ZIP para o Pinata...');

// Verificando se o arquivo existe
if (fs.existsSync(sourcePath)) {
    pinata.pinFromFS(sourcePath, options).then((result) => {
        console.log('\n✅ UPLOAD CONCLUÍDO!');
        console.log('------------------------------------------------');
        console.log('Hash IPFS (CID):', result.IpfsHash);
        console.log('------------------------------------------------');
        console.log('⚠️ IMPORTANTE: Como enviamos um ZIP, o Hash aponta para o arquivo compactado.');
        console.log('Para usar no ENS como site, o ideal é descompactar no Pinata ou usar o método de pasta.');
        console.log('Mas para garantir que suas chaves funcionam, este hash prova o sucesso.');
    }).catch((err) => {
        console.error('❌ Erro no upload:', err);
    });
} else {
    console.error('Arquivo ZIP não encontrado:', sourcePath);
}








