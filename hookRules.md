
# 📜 GEMINI CLI – RULE: Refactor React Native Hooks to Testable

> **Role**: Senior React Native + Testing Engineer
> **Goal**: Refactor hooks to be testable, predictable, and side-effect isolated
> **Stack**: React Native + Expo + Jest/Vitest + Testing Library

---

👉 **Rule số 1 của RN Hook**

> `useEffect` KHÔNG ĐƯỢC chứa business logic

---

## 🧱 STRUCTURAL RULES (BẮT BUỘC)

---

### R1. Hook chỉ orchestration – logic thuần tách ra

❌ Forbidden:

```ts
useEffect(() => {
  if (x > 3) doSomething()
}, [x])
```

✅ Required:

```ts
function handleXChange(x) {}
useEffect(() => handleXChange(x), [x])
```

---

### R2. Không import trực tiếp Native APIs trong hook

❌ Forbidden:

```ts
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
```

✅ Required:

```ts
export interface StorageAdapter {
  get(key: string): Promise<string | null>
}
```

Inject adapter vào hook.

---

### R3. Side-effects phải nằm trong `actions`

❌ Forbidden:

```ts
setState(...)
FileSystem.writeAsStringAsync(...)
```

✅ Required:

```ts
actions.saveFile()
actions.loadData()
```

---

### R4. Không để logic quan trọng trong `useEffect`

❌ Forbidden:

```ts
useEffect(async () => {
  await load()
}, [])
```

✅ Required:

```ts
async function init() {}
useEffect(() => { init() }, [])
```

---

### R5. Hook phải test được bằng `renderHook`

❌ Nếu cần:

```ts
render(<Component />)
```

→ Hook sai kiến trúc

---

### R6. Không dùng `setTimeout`, `setInterval` trực tiếp

❌ Forbidden:

```ts
setTimeout(...)
```

✅ Required:

```ts
export interface TimerAdapter {
  delay(ms: number): Promise<void>
}
```

---

### R7. Native event listeners phải có cleanup rõ ràng

❌ Forbidden:

```ts
NetInfo.addEventListener(...)
```

✅ Required:

```ts
const unsubscribe = netInfo.subscribe(...)
return () => unsubscribe()
```

---

### R8. Không return state rời rạc

❌ Forbidden:

```ts
return { loading, data, error, fetch }
```

✅ Required:

```ts
return {
  state: { loading, data, error },
  actions: { fetch }
}
```

---

### R9. Hook KHÔNG được biết UI

❌ Forbidden:

```ts
Alert.alert(...)
Toast.show(...)
```

✅ Required:

```ts
return { errorCode }
```

Component xử lý UI

---

### R10. Dependency injection bắt buộc

```ts
export function useX(
  deps: Partial<Deps> = defaultDeps
) {}
```

---

## 🧪 TESTING RULES

---

### T1. Test logic thuần KHÔNG cần React

```ts
expect(calculate(x)).toBe(y)
```

---

### T2. Test hook bằng `renderHook`

```ts
const { result } = renderHook(() =>
  useX(mockDeps)
)
```

---

### T3. Không test Native API thật

❌ Forbidden:

```ts
FileSystem.writeAsStringAsync(...)
```

✅ Required:

```ts
expect(storage.save).toHaveBeenCalled()
```

---

### T4. Fake timers cho async

```ts
vi.useFakeTimers()
```

---

## 📁 FILE STRUCTURE (RN)

```text
useMemoryMedia/
├── useMemoryMedia.ts
├── memoryMedia.logic.ts
├── memoryMedia.adapters.ts
```

---

## 🧠 RN-SPECIFIC SMELLS (GEMINI PHẢI PHÁT HIỆN)

| Smell                        | Fix               |
| ---------------------------- | ----------------- |
| `useEffect(async () => ...)` | extract function  |
| Expo API import              | adapter           |
| Alert trong hook             | move to component |
| Hook dài >150 LOC            | split             |

---

## 🧩 EXAMPLE – BEFORE / AFTER

### ❌ BAD

```ts
useEffect(() => {
  FileSystem.writeAsStringAsync(path, data)
}, [])
```

### ✅ GOOD

```ts
async function save() {
  await storage.save(path, data)
}

useEffect(() => { save() }, [])
```

---

## 🧠 MENTAL MODEL CHO GEMINI

> **“Nếu mock hết native API, hook còn test được không?”**

Nếu **KHÔNG** → refactor tiếp.

---

## 🔚 TL;DR – RULE NGẮN GỌN

* Hook ≠ component
* useEffect ≠ business logic
* Native API = adapter
* State + Actions rõ ràng
* Test không cần UI
