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
  console.log("[Auth] Registering user:", { email, name, role })
  console.log("[Auth] API URL:", API_BASE_URL)
  
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

  console.log("[Auth] Register response status:", response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("[Auth] Register failed - response not OK:", errorText)
    throw new Error(`Network error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[Auth] Register response data:", data)
  
  if (data.errors) {
    console.error("[Auth] Register GraphQL errors:", data.errors)
    throw new Error(data.errors[0].message)
  }
  
  if (!data.data?.register) {
    console.error("[Auth] Register - no data returned")
    throw new Error("Registration failed: No data returned")
  }
  
  return data.data.register
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  console.log("[Auth] Logging in user:", { email })
  console.log("[Auth] API URL:", API_BASE_URL)
  
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

  console.log("[Auth] Login response status:", response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("[Auth] Login failed - response not OK:", errorText)
    throw new Error(`Network error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[Auth] Login response data:", data)
  
  if (data.errors) {
    console.error("[Auth] Login GraphQL errors:", data.errors)
    throw new Error(data.errors[0].message)
  }
  
  if (!data.data?.login) {
    console.error("[Auth] Login - no data returned")
    throw new Error("Login failed: No data returned")
  }
  
  return data.data.login
}

export async function getCurrentUser(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important: include cookies
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
      console.warn(`getCurrentUser: Response not OK (${response.status})`)
      return null
    }

    const data = await response.json()
    if (data.errors) {
      // If unauthorized, return null (user not logged in)
      const errorMessage = data.errors[0]?.message || "Unknown error"
      if (errorMessage === "Unauthorized") {
        console.warn("getCurrentUser: Unauthorized - cookies may not be set")
        return null
      }
      console.warn("getCurrentUser: GraphQL error:", errorMessage)
      return null
    }
    return data.data?.me || null
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}
