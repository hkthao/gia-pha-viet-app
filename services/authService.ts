import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { nanoid } from 'nanoid';
import * as Crypto from 'expo-crypto'; // Import expo-crypto
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add AsyncStorage import

// Constants for AsyncStorage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const ID_TOKEN_KEY = 'idToken';
const USER_PROFILE_KEY = 'userProfile';
const REFRESH_TOKEN_KEY = 'refreshToken'; // New constant for refresh token

// Polyfill global.crypto for nanoid
if (typeof global.crypto === 'undefined' || !global.crypto.getRandomValues) {
  global.crypto = {
    ...(global.crypto || {}),
    getRandomValues: Crypto.getRandomValues as unknown as <T extends ArrayBufferView>(array: T) => T,
  };
}

WebBrowser.maybeCompleteAuthSession();

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
const AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;

interface IdTokenPayload {
  name: string;
  email: string;
  picture?: string;
  sub: string;
  nonce?: string;
  exp?: number; // Thêm trường exp (expiration time) vào IdTokenPayload
}

class AuthService {
  private user: IdTokenPayload | null = null;
  private accessToken: string | null = null;
  private idToken: string | null = null;
  private refreshToken: string | null = null; // New private member for refresh token
  private nonce: string | null = null;

  constructor() {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
      console.error('Auth0 environment variables are not set. Check EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID');
    }
  }

  //  method to initialize the session
  public async initSession(): Promise<void> {
    await this._loadSession();
  }

  // Persist authentication data to AsyncStorage
  private async _saveSession() {
    if (this.accessToken) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);
    }
    if (this.idToken) {
      await AsyncStorage.setItem(ID_TOKEN_KEY, this.idToken);
    }
    if (this.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken); // Save refresh token
    }
    if (this.user) {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(this.user));
    }
  }

  // Load authentication data from AsyncStorage
  private async _loadSession() {
    this.accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    this.idToken = await AsyncStorage.getItem(ID_TOKEN_KEY);
    this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY); // Load refresh token
    const userProfileString = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (userProfileString) {
      this.user = JSON.parse(userProfileString) as IdTokenPayload;
    }
  }

  // Clear authentication data from AsyncStorage
  private async _clearSession() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(ID_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY); // Clear refresh token
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    this.user = null;
    this.accessToken = null;
    this.idToken = null;
    this.refreshToken = null; // Clear refresh token
  }

  // Phương thức private để kiểm tra xem token đã hết hạn hay chưa
  private _isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }
    try {
      const decodedToken = jwtDecode<IdTokenPayload>(token);
      // Kiểm tra nếu không có thời gian hết hạn, coi như đã hết hạn
      if (!decodedToken.exp) {
        return true;
      }
      const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
      // Token được coi là hết hạn nếu thời gian hiện tại lớn hơn thời gian hết hạn
      // Trừ đi một khoảng thời gian nhỏ (ví dụ 30 giây) để làm mới token trước khi nó thực sự hết hạn
      return decodedToken.exp < currentTime - 30;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return true; // Nếu có lỗi khi giải mã, coi như token không hợp lệ
    }
  }

  // Phương thức private để làm mới access token
  private async _refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.warn('Không có refresh token. Vui lòng đăng nhập lại.');
      return false;
    }

    try {
      const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: AUTH0_CLIENT_ID || '',
          refresh_token: this.refreshToken,
        }).toString(),
      });

      const data = await response.json();

      if (response.ok) {
        this.accessToken = data.access_token;
        this.idToken = data.id_token || this.idToken; // id_token có thể không có trong phản hồi refresh
        this.refreshToken = data.refresh_token || this.refreshToken; // refresh_token có thể được xoay vòng

        if (this.idToken) {
          this.user = jwtDecode<IdTokenPayload>(this.idToken);
        }
        await this._saveSession();
        console.log('Access token đã được làm mới thành công.');
        return true;
      } else {
        console.error('Lỗi khi làm mới token:', data);
        await this._clearSession(); // Xóa phiên nếu làm mới thất bại
        return false;
      }
    } catch (error) {
      console.error('Lỗi mạng hoặc lỗi không xác định khi làm mới token:', error);
      await this._clearSession(); // Xóa phiên nếu có lỗi
      return false;
    }
  }

  // Get the redirect URL for the platform
  private getRedirectUri(): string {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'familytreeapp', // Replace with your scheme
      path: 'auth',
    });
    console.log('Generated redirectUri:', redirectUri);
    return redirectUri;
  }

  public async login(): Promise<boolean> {
    console.log('Attempting Auth0 login...');
    console.log('AUTH0_DOMAIN:', AUTH0_DOMAIN);
    console.log('AUTH0_CLIENT_ID:', AUTH0_CLIENT_ID);
    const redirectUri = this.getRedirectUri();

    // Generate nonce
    this.nonce = nanoid();

    const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
      `scope=openid profile email offline_access&` + // Thêm offline_access scope
      `audience=${AUTH0_AUDIENCE}&` +
      `response_type=token id_token&` + // response_type=code or token depends on the flow
      `client_id=${AUTH0_CLIENT_ID}&` +
      `redirect_uri=${redirectUri}&` +
      `nonce=${this.nonce}`;
    console.log('Constructed Auth URL:', authUrl);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    console.log('WebBrowser result:', result);

    if (result.type === 'success') {
      const url = new URL(result.url);
      const hashParams = new URLSearchParams(url.hash.substring(1));

      const parsedUrl: { [key: string]: string | undefined } = {};
      for (const [key, value] of hashParams.entries()) {
        parsedUrl[key] = value;
      }

      if (parsedUrl.error) {
        console.error('AuthSession error:', parsedUrl.error_description || parsedUrl.error);
        return false;
      }

      this.accessToken = parsedUrl.access_token ?? null;
      this.idToken = parsedUrl.id_token ?? null;
      this.refreshToken = parsedUrl.refresh_token ?? null;

      if (!this.accessToken) {
        console.error('Access token không được trả về từ Auth0.');
        this.nonce = null;
        return false;
      }

      if (!this.idToken) {
        console.error('ID token không được trả về từ Auth0.');
        this.nonce = null;
        return false;
      }

      const decodedIdToken = jwtDecode<IdTokenPayload>(this.idToken);

      // Verify nonce
      if (!decodedIdToken.nonce || decodedIdToken.nonce !== this.nonce) {
        console.error('Nonce không khớp hoặc thiếu nonce trong ID token. Có thể là tấn công replay.');
        this.nonce = null;
        return false;
      }

      this.user = decodedIdToken;
      console.log('Người dùng đã đăng nhập:', this.user);
      this.nonce = null;
      await this._saveSession();
      return true;
    } else if (result.type === 'cancel') {
      console.log('Authentication cancelled by user.');
    } else if (result.type === 'dismiss') {
      console.log('Authentication dismissed by user.');
    }
    this.nonce = null;
    return false;
  }

  public async logout(): Promise<void> {
    if (!this.user) {
      return;
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'familytreeapp', // Replace with your scheme
      path: 'logout',
    });
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `returnTo=${redirectUri}`;

    await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
    await this._clearSession(); // Clear session
  }

  public isAuthenticated(): boolean {
    return !!this.user;
  }

  public getUser(): IdTokenPayload | null {
    return this.user;
  }

  public async getAccessToken(): Promise<string | null> {
    // Nếu accessToken là null nhưng refresh token tồn tại, hãy thử tải phiên từ bộ nhớ.
    // Điều này xử lý các trường hợp initSession có thể chưa hoàn thành hoặc bị bỏ qua.
    if (!this.accessToken && this.refreshToken) {
      console.log('Access token không có trong bộ nhớ nhưng refresh token có. Đang cố gắng tải phiên.');
      await this._loadSession();
    }

    // Bây giờ, kiểm tra accessToken (mới được tải hoặc đã tồn tại)
    if (!this.accessToken || this._isTokenExpired(this.accessToken)) {
      console.log('Access token hết hạn hoặc không tồn tại. Đang cố gắng làm mới.');
      const success = await this._refreshAccessToken();
      if (!success) {
        console.error('Không thể làm mới token. Người dùng có thể cần đăng nhập lại.');
        return null;
      }
    }
    return this.accessToken;
  }
}

export const authService = new AuthService();
