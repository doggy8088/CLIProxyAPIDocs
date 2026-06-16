---
outline: 'deep'
---

# Возможность маршрутизации моделей

Возможность маршрутизации моделей позволяет плагину выбрать, где должен выполняться подходящий запрос модели, до того как хост сопоставит модель с provider и выберет учётные данные.

Используйте её, когда тело запроса, заголовки, query-параметры или исходная клиентская модель должны выбрать один из вариантов:

- executor самого плагина-маршрутизатора;
- executor другого плагина;
- встроенный provider path, например `codex`, `antigravity`, `xai` или `claude`.

## Поле возможности

```json
{
  "capabilities": {
    "model_router": true
  }
}
```

Если маршрутизатор может отправлять запросы в собственный executor, также объявите возможность executor:

```json
{
  "capabilities": {
    "model_router": true,
    "executor": true,
    "executor_model_scope": "static",
    "executor_input_formats": ["claude"],
    "executor_output_formats": ["claude"]
  }
}
```

Исходный код:

- `sdk/pluginapi/types.go`: `ModelRouter`, `ModelRouteRequest`, `ModelRouteResponse`, `ModelRouteTargetKind`
- `sdk/pluginabi/types.go`: `model.route`
- `internal/pluginhost/model_router.go`: приоритет маршрутизаторов, проверка цели и доступность встроенных provider
- `sdk/api/handlers/handlers.go`: входной путь запроса до обычного provider/auth resolution

Примеры:

- `examples/plugin/claude-web-search-router/go/main.go`
- `examples/plugin/claude-web-search-router/go/fallback.go`

## Методы

| Метод | Назначение |
| --- | --- |
| `model.route` | Возвращает решение маршрутизации для текущего клиентского запроса. |

## Когда выполняется

Хост вызывает включённые model routers до обычного сопоставления модели с provider и выбора учётных данных. Плагины с более высоким priority выполняются первыми. Если маршрутизатор возвращает `Handled: false`, невалидную цель или недоступную цель, хост пропускает этот результат и пробует следующий маршрутизатор. Если ни один маршрутизатор не обработал запрос, продолжается обычный путь хоста.

Запрос всё ещё находится в исходном клиентском протоколе. Например, Claude-compatible запрос приходит с `SourceFormat: "claude"`, а сырое тело Claude-запроса находится в `Body`.

## Запрос

```json
{
  "Plugin": {},
  "PluginID": "claude-web-search-router",
  "SourceFormat": "claude",
  "RequestedModel": "claude-sonnet-4-6",
  "Stream": true,
  "Headers": {},
  "Query": {},
  "Body": "base64-client-body",
  "Metadata": {},
  "AvailableProviders": ["antigravity", "codex", "xai"]
}
```

Важные поля:

| Поле | Описание |
| --- | --- |
| `PluginID` | Локальный ID плагина-маршрутизатора в хосте. |
| `SourceFormat` | Исходный протокол клиента, например `openai`, `claude` или `gemini`. |
| `RequestedModel` | Клиентская модель до provider/auth resolution. |
| `Stream` | Ожидает ли клиент streaming output. |
| `Headers` / `Query` | Входящие заголовки и query-параметры. |
| `Body` | Сырое тело клиентского запроса. В RPC JSON кодируется как base64. |
| `Metadata` | Best-effort снимок контекста запроса. Рассматривайте как read-only JSON-like данные. |
| `AvailableProviders` | Ключи встроенных provider, для которых сейчас зарегистрированы учётные данные. Проверяйте их перед возвратом `TargetKind: "provider"`. |

## Ответ

Не обрабатывать:

```json
{
  "Handled": false
}
```

Маршрутизировать в executor того же плагина:

```json
{
  "Handled": true,
  "TargetKind": "self",
  "Reason": "matched_web_search"
}
```

Маршрутизировать в executor другого плагина:

```json
{
  "Handled": true,
  "TargetKind": "executor",
  "Target": "search-executor",
  "Reason": "matched_search_executor"
}
```

Маршрутизировать во встроенный provider:

```json
{
  "Handled": true,
  "TargetKind": "provider",
  "Target": "codex",
  "TargetModel": "gpt-5.4-mini",
  "Reason": "matched_codex_web_search"
}
```

## Типы целей

| TargetKind | Target | TargetModel | Поведение |
| --- | --- | --- | --- |
| `self` | Игнорируется плагином; хост использует ID текущего router plugin. | Игнорируется. | Выполняет executor самого плагина-маршрутизатора. |
| `executor` | ID целевого плагина. | Игнорируется. | Напрямую выполняет executor другого плагина. |
| `provider` | Ключ встроенного provider. | Необязательная замена модели. | Продолжает путь через встроенный AuthManager и executor provider. |

Прямые маршруты в plugin executor выполняются без выбора auth record. Целевой executor должен объявить возможность executor, разрешать static execution через `executor_model_scope: "static"` или `"both"` и поддерживать форматы запроса/ответа для текущего запроса.

Маршруты provider должны указывать provider, который есть в `AvailableProviders`. Если `TargetModel` пустой, хост сохраняет исходную клиентскую модель. Если целевому provider нужна provider-native модель, задайте `TargetModel` явно вместо пересылки клиентского имени модели.

## Пример конфигурации

Пример `claude-web-search-router` использует ModelRouter, чтобы обнаруживать встроенные запросы Claude Code `web_search` и направлять их во встроенные provider с поддержкой web search или в собственный Tavily executor плагина.

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs:
    claude-web-search-router:
      enabled: true
      priority: 20
      route: fallback
      antigravity_model: "gemini-3.1-flash-lite"
      codex_model: "gpt-5.4-mini"
      xai_model: "grok-4.3"
      tavily_api_keys:
        - "tvly-xxxxxxxx"
      require_web_search_only: true
```

Поведение маршрутов примера:

| Route | Цель |
| --- | --- |
| `antigravity_google` | `TargetKind: "provider"`, `Target: "antigravity"`, `TargetModel: antigravity_model` |
| `codex_web_search` | `TargetKind: "provider"`, `Target: "codex"`, `TargetModel: codex_model` |
| `xai_web_search` | `TargetKind: "provider"`, `Target: "xai"`, `TargetModel: xai_model` |
| `tavily` | `TargetKind: "self"`, plugin executor сам обрабатывает Tavily. |
| `fallback` | `TargetKind: "self"`, plugin executor оркестрирует fallback по нескольким backend. |

## Замечания по разработке

- Возвращайте `Handled: false` для запросов, которые плагин не распознаёт, чтобы нижестоящие routers и обычный путь хоста могли продолжить обработку.
- Держите `model.route` быстрым. Он должен классифицировать запрос и выбрать цель, а не выполнять полный upstream-запрос.
- Используйте `AvailableProviders` перед возвратом цели встроенного provider.
- Используйте `self`, когда executor плагина должен оркестрировать fallback, вызывать `host.model.*` или использовать внешний сервис плагина.
- Используйте `provider`, когда запрос должен продолжить путь через управляемый хостом выбор auth, request logging, usage accounting и встроенный executor.
- `model_router` включается через capability flag и метод `model.route`. Повышение plugin schema version не требуется.
