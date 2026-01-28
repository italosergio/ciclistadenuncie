console.log('🔍 Verificando variáveis de ambiente:\n');
console.log('VITE_FIREBASE_PROJECT_ID:', process.env.VITE_FIREBASE_PROJECT_ID || import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'NÃO DEFINIDO');
console.log('VITE_FIREBASE_DATABASE_URL:', process.env.VITE_FIREBASE_DATABASE_URL || import.meta.env?.VITE_FIREBASE_DATABASE_URL || 'NÃO DEFINIDO');
console.log('\n✅ Se aparecer "ciclistadenuncie" (sem -prod), está correto!');
