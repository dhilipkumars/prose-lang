const API = '';

async function request(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const api = {
    register: (data) => request('POST', '/api/register', data),
    login: (data) => request('POST', '/api/login', data),
    listBooks: () => request('GET', '/api/books'),
    addBook: (data) => request('POST', '/api/books', data),
    removeBook: (id) => request('DELETE', `/api/books/${id}`),
    checkout: (memberId, bookIds) =>
        request('POST', `/api/members/${memberId}/checkout`, { book_ids: bookIds }),
    borrowedBooks: (memberId) =>
        request('GET', `/api/members/${memberId}/borrowed`),
    returnBook: (memberId, bookId) =>
        request('POST', `/api/members/${memberId}/return`, { book_id: bookId }),
};
