# Testing Guide: GSQL AI Chat Interface with RAG

## Prerequisites

1. **Environment Setup**
   - Ensure you have Node.js 18+ installed
   - All dependencies installed: `npm run install:all`
   - Backend `.env` file configured with:
     - `GEMINI_API_KEY` (required for AI)
     - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (for auth)
   - Frontend `.env.local` configured with:
     - `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

2. **Knowledge Base File**
   - Verify `backend/src/data/gsql-knowledge-base.md` exists (2,982 lines)
   - This file contains the RAG knowledge base

## Starting the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 3001) concurrently.

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Accessing GSQL AI

1. Open your browser to: `http://localhost:3000/gsql-ai`
2. You should see the GSQL AI chat interface with:
   - Welcome message
   - Chat input area at bottom
   - Schema button in header
   - Example prompts sidebar
   - Reset conversation button

## Testing Checklist

### 1. Basic Functionality

#### ✅ Test Authentication
- [ ] Click anywhere in the chat → Should prompt for login
- [ ] Login with valid credentials → Should allow access
- [ ] Verify user email shows in header

#### ✅ Test Welcome Message
- [ ] Verify welcome message displays on page load
- [ ] Check that welcome message has proper formatting
- [ ] Verify example prompts are visible in sidebar

### 2. Schema Management

#### ✅ Test Schema Editor
- [ ] Click "Schema" button → Schema editor should open
- [ ] Enter schema: `CREATE VERTEX Person (PRIMARY_ID id STRING, name STRING)`
- [ ] Close schema editor → Schema should persist
- [ ] Refresh page → Schema should still be there (localStorage)
- [ ] Open schema editor again → Should show saved schema

#### ✅ Test Schema-Aware Generation
- [ ] Set schema with vertex types: `Person`, `Product`
- [ ] Ask: "Create a query to find all Person vertices"
- [ ] Verify generated code uses `Person` type correctly
- [ ] Verify code matches schema structure

### 3. RAG Integration Testing

#### ✅ Verify RAG is Working
- [ ] Ask a question: "Create a PageRank query"
- [ ] Check console logs (backend terminal) → Should see: `📚 GSQL RAG: Retrieved X relevant chunks`
- [ ] In the response, look for RAG context badge
- [ ] Should show: "Using RAG: X knowledge sections (Y% relevance)"
- [ ] Click to expand → Should show list of relevant sections

#### ✅ Test RAG Context Display
- [ ] Generate a query
- [ ] Look for blue RAG context box below the code
- [ ] Verify it shows number of chunks retrieved
- [ ] Verify it shows confidence percentage
- [ ] Expand "View relevant sections" → Should list section titles
- [ ] Verify section names are readable (GSQL_ prefix removed, underscores replaced)

#### ✅ Test Different Query Types
- [ ] Ask about accumulators → Should retrieve accumulator sections
- [ ] Ask about patterns → Should retrieve pattern sections
- [ ] Ask about control flow → Should retrieve control flow sections
- [ ] Verify different queries retrieve different relevant sections

### 4. Conversation History

#### ✅ Test Multi-Turn Conversation
- [ ] Ask: "Create a query to find friends"
- [ ] Wait for response
- [ ] Ask follow-up: "Now modify it to exclude direct friends"
- [ ] Verify assistant remembers previous context
- [ ] Verify response builds on previous query

#### ✅ Test Conversation Reset
- [ ] Have a conversation with multiple messages
- [ ] Click reset button (rotate icon)
- [ ] Verify conversation clears
- [ ] Verify welcome message reappears
- [ ] Verify schema persists (doesn't reset)

### 5. Code Generation

#### ✅ Test Basic Query Generation
- [ ] Ask: "Create a query to find all friends of friends"
- [ ] Verify code block appears
- [ ] Verify code is properly formatted
- [ ] Verify explanation appears
- [ ] Verify features list appears

#### ✅ Test Code Copy Functionality
- [ ] Generate a query
- [ ] Click "Copy" button on code block
- [ ] Verify toast notification: "Code copied to clipboard!"
- [ ] Paste in text editor → Should match generated code
- [ ] Verify button changes to "Copied!" with checkmark

#### ✅ Test Example Prompts
- [ ] Click on example prompt: "Find Friends of Friends"
- [ ] Verify prompt appears in input field
- [ ] Send the message
- [ ] Verify appropriate query is generated

### 6. Error Handling

#### ✅ Test Error Scenarios
- [ ] Stop backend server → Try to generate query
- [ ] Verify error message displays
- [ ] Verify error is user-friendly
- [ ] Restart backend → Should work again

#### ✅ Test Empty Input
- [ ] Try to send empty message → Should be disabled
- [ ] Verify send button is disabled when input is empty

### 7. UI/UX Testing

#### ✅ Test Responsive Design
- [ ] Resize browser window
- [ ] Verify layout adapts properly
- [ ] Verify chat area remains usable
- [ ] Verify sidebar collapses appropriately on mobile

#### ✅ Test Loading States
- [ ] Send a query
- [ ] Verify loading spinner appears
- [ ] Verify "Generating GSQL query..." message
- [ ] Verify input is disabled during loading

#### ✅ Test Auto-Scroll
- [ ] Have multiple messages
- [ ] Send new message
- [ ] Verify page auto-scrolls to bottom
- [ ] Verify new message is visible

### 8. Advanced Features

#### ✅ Test Complex Queries
- [ ] Ask: "Create a PageRank algorithm with configurable parameters"
- [ ] Verify complex code is generated
- [ ] Verify proper use of accumulators
- [ ] Verify control flow (WHILE loops, etc.)

#### ✅ Test Schema Integration
- [ ] Set complex schema with multiple vertex/edge types
- [ ] Ask query that uses multiple types
- [ ] Verify generated code respects all schema types

#### ✅ Test RAG Accuracy
- [ ] Ask about specific GSQL features (e.g., "How do I use GroupByAccum?")
- [ ] Verify RAG retrieves relevant accumulator sections
- [ ] Verify generated code uses correct syntax from knowledge base

## Expected Console Outputs

### Backend Console (Terminal running backend)
```
✅ GSQL AI: Gemini API initialized
✅ Loaded 35 GSQL knowledge base chunks
📚 GSQL RAG: Retrieved 7 relevant chunks
```

### Frontend Console (Browser DevTools)
- No errors should appear
- Network tab should show successful POST to `/api/gsql-ai/generate`
- Response should include `ragContext` object

## Verification Points

### ✅ RAG is Working If:
1. Backend logs show: `📚 GSQL RAG: Retrieved X relevant chunks`
2. Response includes `ragContext` object
3. UI shows RAG context badge with sections count
4. Different queries retrieve different relevant sections

### ✅ Conversation History Works If:
1. Follow-up questions reference previous messages
2. Assistant maintains context across turns
3. Generated code builds on previous queries

### ✅ Schema Persistence Works If:
1. Schema persists after page refresh
2. Schema is used in generated queries
3. Schema editor shows saved schema when reopened

## Troubleshooting

### Issue: RAG not showing
- **Check**: Backend console for RAG logs
- **Verify**: `gsql-knowledge-base.md` exists and is readable
- **Check**: File path is correct: `backend/src/data/gsql-knowledge-base.md`

### Issue: Conversation history not working
- **Check**: Backend receives `history` parameter in request
- **Verify**: History array is properly formatted
- **Check**: Gemini API is using `startChat()` with history

### Issue: Schema not persisting
- **Check**: Browser localStorage (DevTools → Application → Local Storage)
- **Verify**: Key `gsql-ai-schema` exists
- **Check**: No browser restrictions blocking localStorage

### Issue: Code not generating
- **Check**: `GEMINI_API_KEY` is set in backend `.env`
- **Verify**: API key is valid
- **Check**: Backend console for error messages
- **Verify**: Network request succeeds (check browser DevTools)

## Sample Test Queries

1. **Simple Query**: "Create a query to find all Person vertices"
2. **Pattern Query**: "Find all friends of friends for a given person"
3. **Algorithm Query**: "Generate a PageRank query"
4. **Complex Query**: "Create a recommendation query using collaborative filtering"
5. **Accumulator Query**: "Show me how to use GroupByAccum"
6. **Control Flow Query**: "Create a query with a WHILE loop"

## Success Criteria

✅ **All tests pass** when:
- RAG context appears in responses
- Conversation history maintains context
- Schema persists and is used correctly
- Code generation works for various query types
- UI is responsive and user-friendly
- Error handling works gracefully

## Next Steps After Testing

Once testing is complete:
1. Verify all features work as expected
2. Check performance (response times)
3. Test with real-world complex schemas
4. Gather user feedback
5. Document any issues found
