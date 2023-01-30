import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'

import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJTlCc0NLCrcrVMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1idXlscnl2Yi51cy5hdXRoMC5jb20wHhcNMjExMjEwMDYyNDE0WhcN
MzUwODE5MDYyNDE0WjAkMSIwIAYDVQQDExlkZXYtYnV5bHJ5dmIudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+LNgjZmBTFCsR1Ak
LTo/a0VGcdPRs2+N9TShom9FzDx+ZANUO5uSJ6EGpY7KkgtLEA3YW1XnbgktCUD4
/8wcrszo+WKWoa4Sfx2l8IHhOjRaOu1JJmR9z7uwnFZc+x8TFaLIDyVLFOsrs8rO
0JuNlGlZ3Ng6ih7yTDAn23ql27Dkt+DnMMu1qxKc83Zuvx55o3wVhoZwBHfO7XCW
Bjoaf9c/IWUkAyLjotrIp6pVU7qJ/LKuB9z5Ej/dMOkmSlk76z1Sd5XomC0/qfhF
2K5Idu9p/FjDMS2ypUK4inmdKvNzXDY4MDyeY9zaYF13qCLeklpfhGQHdE5vGFjV
p/VRCwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSz/fMuc90a
mZcgPlYbtb2MuuTh4TAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
APC5O2Hgl/wo+XqaemlK+uJoWArGLK+DXvKx+rLeOIfhzGNJrEYBjQoCUyk1LN1p
948+CvTzyMGnT0hwpZDmuA/C28H2IOE/iJtGtztp0xheRqsTpsQzLM9kNpHUG5Gd
ME2XbAG8xbZ1x8Kovmy5Ux8yflw5Thh0bfUYSynMSxDydP9mQs4g/YdumUTIHOOU
kIyTkmYyug/Ug2YyyCAZtZ4OiQj7/zsrcUpMqpnlY1l+3QFo5BvNed4rYnQ4Ufmf
A/vbD/37gQBDIcEoDEBFuF1JziTUT/qXOJgs3UHSxqdpYSyPGKbElupK3jeiIe8A
QAqSlO5chaKQIz3wSpmWcbE=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
