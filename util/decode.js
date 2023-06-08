module.exports = {
    decode: function(query) {
        return query.split('&').reduce((params, param) => {
            const [key, value] = param.split('=');
            params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
        }, {});
    },
    getBase64ImageData: async function(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64data = buffer.toString('base64');
            return base64data;
        } 
        catch (error) {
            console.error('Error getting Base64-encoded image data:', error);
            return null;
        }
    }
}