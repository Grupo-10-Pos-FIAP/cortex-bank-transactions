# Configuração do Cloudinary

Este projeto usa o Cloudinary para upload de imagens e arquivos.

## Passos para Configurar

### 1. Obter Credenciais do Cloudinary

1. Acesse o [Dashboard do Cloudinary](https://cloudinary.com/console)
2. Faça login na sua conta
3. No dashboard, você encontrará:
   - **Cloud Name**: Nome da sua conta (ex: `dxyz1234`)
   - Este valor está visível no topo do dashboard

### 2. Criar um Upload Preset

1. No dashboard do Cloudinary, vá em **Settings** > **Upload**
2. Role até a seção **Upload presets**
3. Clique em **Add upload preset**
4. Configure o preset:
   - **Preset name**: Escolha um nome (ex: `transactions_upload`)
   - **Signing mode**: Selecione **Unsigned** (para upload direto do frontend)
   - **Folder**: Opcional - defina uma pasta padrão (ex: `transactions`)
   - **Format**: Opcional - defina formatos permitidos
   - Clique em **Save**

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto `transactions/` e adicione:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=seu-cloud-name-aqui
CLOUDINARY_UPLOAD_PRESET=seu-upload-preset-aqui
CLOUDINARY_FOLDER=transactions
```

**Exemplo:**
```env
CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_UPLOAD_PRESET=transactions_upload
CLOUDINARY_FOLDER=transactions
```

### 4. Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento:

```bash
npm start
```

## Estrutura de Pastas no Cloudinary

Os arquivos serão salvos na pasta `transactions/` (ou a pasta que você configurar) no Cloudinary.

## Segurança

⚠️ **Importante**: 
- O Upload Preset deve ser configurado como **Unsigned** para funcionar diretamente do frontend
- Não exponha suas credenciais de API Secret no frontend
- Use apenas Cloud Name e Upload Preset no frontend
- Para produção, considere usar um backend proxy para uploads mais seguros

## Testando

Após configurar, teste fazendo upload de uma imagem no formulário de transações. A URL retornada será do Cloudinary (formato: `https://res.cloudinary.com/...`).

