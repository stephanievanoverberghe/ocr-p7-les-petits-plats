class Api {
    /**
     * Create an Api instance.
     * @param {string} url - The URL of the API.
     */
    constructor(url) {
        this._url = url;
    }

    async get() {
        try {
            const response = await fetch(this._url);
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('An error occurs', error);
            return null;
        }
    }
}

export { Api };
