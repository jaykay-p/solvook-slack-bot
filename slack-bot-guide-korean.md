# Slack 봇 개발 가이드 - 프론트엔드 개발자를 위한 핵심 정리

## 개요

Slack 봇은 이벤트 기반 아키텍처로 동작합니다. DOM 이벤트를 다루듯이 Slack 워크스페이스의 이벤트를 처리한다고 생각하면 됩니다.

## 핵심 개념

### 1. Socket Mode vs HTTP Mode

**개발 환경 (Socket Mode)**
- WebSocket 연결로 실시간 통신
- 로컬 테스트에 최적 (public URL 불필요)
- `npm run dev`로 즉시 테스트 가능

**프로덕션 (HTTP Mode)**
- Webhook 기반 통신
- Public URL 필요
- 확장성과 안정성 우수

### 2. 환경 변수 설정

```bash
# .env 파일
SLACK_BOT_TOKEN=xoxb-...      # Bot User OAuth Token
SLACK_SIGNING_SECRET=...       # 요청 검증용
SLACK_APP_TOKEN=xapp-...       # Socket Mode용 App-Level Token
```

## Slack 앱 설정

### 필수 설정 단계

1. **앱 생성**: [api.slack.com/apps](https://api.slack.com/apps)에서 새 앱 생성
2. **Socket Mode 활성화**: Settings → Socket Mode 에서 활성화
3. **App-Level Token 생성**: `connections:write` 스코프로 생성
4. **Bot Token Scopes 추가**: OAuth & Permissions에서 필요한 권한 설정
5. **Event Subscriptions 설정**: 봇이 반응할 이벤트 선택
6. **워크스페이스에 설치**: Install App 메뉴에서 설치

### 핵심 Bot Token Scopes

```
app_mentions:read    # 멘션 읽기
channels:history     # 채널 메시지 읽기
chat:write          # 메시지 전송
commands            # 슬래시 커맨드 사용
im:write            # DM 전송
reactions:write     # 이모지 반응
users:read          # 사용자 정보 조회
```

## 프로젝트 구조

```
src/
├── index.ts              # 진입점 (Express의 app.js 역할)
└── listeners/            # 이벤트 핸들러
    ├── commands/         # 슬래시 커맨드 (/hello, /help)
    ├── events/           # 실시간 이벤트 (메시지, 멘션)
    ├── actions/          # 버튼, 폼 등 인터랙션
    └── shortcuts/        # 전역 단축키와 워크플로우
```

## 이벤트 타입별 구현

### 1. 슬래시 커맨드 (Slash Commands)

사용자가 `/hello`를 입력하면 실행되는 핸들러:

```typescript
// commands/hello.ts
export async function helloCommand({ command, ack, say, client }) {
  await ack(); // 항상 먼저 응답 확인
  
  const userInfo = await client.users.info({
    user: command.user_id
  });
  
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `안녕하세요 *${userInfo.user?.real_name}*님! 👋`
        }
      }
    ]
  });
}

// commands/index.ts에 등록
app.command('/hello', helloCommand);
```

**핵심 포인트:**
- `ack()`를 항상 먼저 호출 (3초 타임아웃 방지)
- `say()`로 같은 채널에 응답
- Block Kit으로 리치 메시지 작성

### 2. 이벤트 리스너 (Event Listeners)

멘션이나 메시지에 반응하는 핸들러:

```typescript
// events/app-mention.ts
export async function appMentionEvent({ event, say }) {
  const messageText = event.text.toLowerCase();
  
  if (messageText.includes('도움')) {
    await say({
      text: `<@${event.user}>님, 무엇을 도와드릴까요?`,
      thread_ts: event.ts // 스레드로 답장
    });
  }
}

// events/message.ts - DM과 특정 키워드 처리
export async function messageEvent({ event, say, client }) {
  // 봇 메시지 무시
  if ('bot_id' in event) return;
  
  const channelInfo = await client.conversations.info({
    channel: event.channel
  });
  
  // DM 처리
  if (channelInfo.channel?.is_im) {
    await say(`DM을 받았습니다: "${event.text}"`);
    return;
  }
  
  // 긴급 키워드 감지
  if (event.text?.includes('긴급')) {
    await client.reactions.add({
      channel: event.channel,
      name: 'warning',
      timestamp: event.ts
    });
  }
}
```

**핵심 포인트:**
- 이벤트는 `ack()` 불필요 (알림이지 요청이 아님)
- 봇 메시지 무한 루프 방지 필수
- 스레드 답장으로 대화 정리

### 3. 인터랙티브 컴포넌트 (Interactive Components)

버튼과 모달 폼 처리:

```typescript
// 버튼이 있는 메시지 전송
await say({
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '작업을 선택하세요:' }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '승인' },
          action_id: 'approve_request',
          style: 'primary'
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '거절' },
          action_id: 'reject_request',
          style: 'danger'
        }
      ]
    }
  ]
});

// actions/approve-request.ts - 버튼 클릭 처리
export async function approveRequestAction({ ack, body, client }) {
  await ack();
  
  // 원본 메시지 업데이트
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: '✅ 승인되었습니다!'
  });
}

// 모달 열기
await client.views.open({
  trigger_id: body.trigger_id,
  view: {
    type: 'modal',
    callback_id: 'task_modal',
    title: { type: 'plain_text', text: '새 작업' },
    submit: { type: 'plain_text', text: '생성' },
    blocks: [
      {
        type: 'input',
        block_id: 'task_title',
        label: { type: 'plain_text', text: '작업 제목' },
        element: {
          type: 'plain_text_input',
          action_id: 'title_input'
        }
      }
    ]
  }
});
```

**핵심 포인트:**
- `action_id`로 핸들러 연결
- `trigger_id`는 모달 열기에 필수
- 메시지 업데이트로 상태 변경 표시

### 4. 글로벌 단축키 (Global Shortcuts)

어디서나 실행 가능한 단축키:

```typescript
// shortcuts/create-task.ts
export async function createTaskShortcut({ ack, body, client }) {
  await ack();
  
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      // 모달 정의
    }
  });
}

// 등록
app.shortcut('create_task', createTaskShortcut);
```

## 테스트 전략

### 로컬 개발 테스트

```bash
# 1. 개발 서버 시작
npm run dev

# 2. Slack에서 테스트
/hello                    # 슬래시 커맨드
@봇이름 도움말            # 멘션
DM으로 메시지 보내기      # DM 처리

# 3. 실시간 로그 확인
console.log()로 디버깅
```

### 자동화 테스트

```typescript
// __tests__/commands/hello.test.ts
import { helloCommand } from '../../src/listeners/commands/hello';

describe('Hello Command', () => {
  it('should respond with greeting', async () => {
    const mockAck = jest.fn();
    const mockSay = jest.fn();
    const mockClient = {
      users: {
        info: jest.fn().mockResolvedValue({
          user: { real_name: 'Test User' }
        })
      }
    };
    
    await helloCommand({
      command: { user_id: 'U123' },
      ack: mockAck,
      say: mockSay,
      client: mockClient
    });
    
    expect(mockAck).toHaveBeenCalled();
    expect(mockSay).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining('Test User')
            })
          })
        ])
      })
    );
  });
});
```

### 통합 테스트

```typescript
// Slack API 모킹
import { MockedSlackClient } from '@slack/bolt/test-helpers';

describe('Integration Tests', () => {
  let app;
  let client;
  
  beforeEach(() => {
    client = new MockedSlackClient();
    app = new App({
      token: 'test-token',
      signingSecret: 'test-secret',
      client
    });
  });
  
  it('should handle message with urgent keyword', async () => {
    await app.processEvent({
      type: 'message',
      text: '긴급! 서버 다운',
      channel: 'C123',
      ts: '123.456'
    });
    
    expect(client.reactions.add).toHaveBeenCalledWith({
      channel: 'C123',
      name: 'warning',
      timestamp: '123.456'
    });
  });
});
```

## 모범 사례

### 1. 에러 처리

```typescript
export async function commandHandler({ ack, say }) {
  await ack();
  
  try {
    // 비즈니스 로직
    await riskyOperation();
  } catch (error) {
    console.error('Command error:', error);
    await say('죄송합니다. 오류가 발생했습니다.');
  }
}
```

### 2. 타입 안정성

```typescript
import { 
  SlackCommandMiddlewareArgs, 
  AllMiddlewareArgs 
} from '@slack/bolt';

interface CommandArgs extends SlackCommandMiddlewareArgs, AllMiddlewareArgs {}

export async function typedCommand(args: CommandArgs): Promise<void> {
  const { command, ack, say } = args;
  // 타입 체크 완료
}
```

### 3. 비동기 처리

```typescript
// 즉시 응답 후 백그라운드 처리
export async function longRunningCommand({ ack, say }) {
  await ack();
  await say('처리를 시작합니다...');
  
  // 백그라운드에서 실행
  processInBackground().then(result => {
    say(`✅ 완료: ${result}`);
  }).catch(error => {
    say(`❌ 실패: ${error.message}`);
  });
}
```

### 4. 메시지 포맷팅

```typescript
// Block Kit Builder 활용
const message = {
  blocks: [
    {
      type: 'header',
      text: { type: 'plain_text', text: '📊 일일 리포트' }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*완료:*\n5 작업' },
        { type: 'mrkdwn', text: '*진행중:*\n3 작업' }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `생성: <!date^${Date.now()/1000}^{date_long}|${new Date().toLocaleDateString()}>` }
      ]
    }
  ]
};
```

## 일반적인 문제 해결

### 문제: 봇이 응답하지 않음
**해결**: Socket Mode 활성화 확인, App Token 검증

### 문제: "not_authed" 에러
**해결**: Bot Token Scopes 확인, 워크스페이스 재설치

### 문제: 3초 타임아웃
**해결**: `ack()`를 핸들러 첫 줄에 호출

### 문제: 무한 루프
**해결**: 봇 메시지 필터링 추가
```typescript
if ('bot_id' in event) return;
```

### 문제: 모달이 열리지 않음
**해결**: `trigger_id` 확인 (3초 내 사용 필요)

## 성능 최적화

### 1. 이벤트 필터링
```typescript
// 불필요한 이벤트 조기 리턴
export async function messageEvent({ event }) {
  if (event.subtype) return; // 수정, 삭제 등 무시
  if (!event.text?.includes('봇')) return; // 키워드 없으면 무시
  // 실제 처리
}
```

### 2. API 호출 최소화
```typescript
// 캐싱 활용
const userCache = new Map();

async function getUserInfo(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  
  const info = await client.users.info({ user: userId });
  userCache.set(userId, info);
  return info;
}
```

### 3. 배치 처리
```typescript
// 여러 메시지 한 번에 전송
await client.conversations.postBulkMessage({
  channel: 'C123',
  messages: [
    { text: '메시지 1' },
    { text: '메시지 2' },
    { text: '메시지 3' }
  ]
});
```

## 보안 고려사항

1. **환경 변수 관리**: 토큰을 코드에 하드코딩하지 않기
2. **요청 검증**: Signing Secret으로 모든 요청 검증
3. **권한 최소화**: 필요한 최소한의 스코프만 요청
4. **사용자 검증**: 민감한 작업 전 사용자 권한 확인
5. **로그 관리**: 민감한 정보 로깅 방지

## 추가 자료

- [Slack Bolt 문서](https://slack.dev/bolt-js)
- [Block Kit Builder](https://app.slack.com/block-kit-builder) - 메시지 디자인 도구
- [Slack API 문서](https://api.slack.com)
- [이벤트 타입 목록](https://api.slack.com/events)