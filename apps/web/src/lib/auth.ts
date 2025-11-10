import { API_BASE_URL } from "@engagement-nexus/config"

export interface AuthResponse {
  user: {
    _id: string
    email: string
    name: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role?: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation Register($email: String!, $password: String!, $name: String!, $role: String) {
          register(email: $email, password: $password, name: $name, role: $role) {
            user { _id email name role }
            accessToken
            refreshToken
          }
        }
      `,
      variables: { email, password, name, role },
    }),
  })

  const data = await response.json()
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data.register
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            user { _id email name role }
            accessToken
            refreshToken
          }
        }
      `,
      variables: { email, password },
    }),
  })

  const data = await response.json()
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data.login
}

export async function getCurrentUser(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query Me {
            me {
              _id
              email
              name
              role
            }
          }
        `,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.errors) {
      // If unauthorized, return null (user not logged in)
      if (data.errors[0]?.message === "Unauthorized") {
        return null
      }
      return null
    }
    return data.data?.me || null
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}
