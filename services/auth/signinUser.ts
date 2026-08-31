export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  success: boolean;
  message?: string;
}

export const SigninUser = async (payload: SigninRequest): Promise<SigninResponse> => {
  let response: Response;

  try {
    response = await fetch('/api/v1/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo iniciar sesión. Intenta nuevamente.');
  }

  return data;
};
