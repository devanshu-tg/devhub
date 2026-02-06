# GSQL Comprehensive Knowledge Base

This document contains comprehensive GSQL reference information extracted from official TigerGraph documentation, optimized for AI parsing and RAG retrieval.

## GSQL_LANGUAGE_FUNDAMENTALS

### What Sets GSQL Apart

GSQL is the choice for fast and scalable graph operations and analytics. GSQL's similarity to SQL, high-level syntax, Turing completeness, and built-in parallelism brings faster performance, faster development and the ability to describe any algorithm.

**Designed for Analytics**: GSQL is designed for complex graph analytics. By taking advantage of a unique feature of the GSQL query language - accumulators - users can leverage TigerGraph's Massively Parallel Processing (MPP) capability without the pain and fuss traditionally associated with parallel programming.

**Turing-complete**: GSQL is Turing-complete with full support for imperative and procedural programming, ideal for algorithmic computation. The Turing completeness of the language, especially with the conventional control flow statements, allows users to describe any algorithm with GSQL.

**Fast Loading and Querying**: Data loading procedures and queries written in GSQL take full advantage of TigerGraph's MPP capability, enabling blazing-fast data ingestion as well as querying.

**SQL-like**: GSQL features an SQL-like syntax that reduces the learning curve for SQL programmers.

### Language Characteristics

- Pattern-based querying using ASCII art syntax
- Accumulator-based aggregation
- Full control flow support (IF, WHILE, FOREACH, CASE)
- Support for stored procedures and ad-hoc queries
- Distributed query execution
- Vector search capabilities
- OpenCypher compatibility

## GSQL_SYNTAX_REFERENCE

### CREATE QUERY Syntax

```gsql
CREATE [OR REPLACE] [DISTRIBUTED] QUERY query_name(parameter_list) 
[FOR GRAPH graph_name] 
[RETURNS (return_type)] 
SYNTAX v3 {
  // Variable declarations
  // Query body
  // Output statements
}
```

**Key Components:**
- `OR REPLACE`: Replace existing query if it exists
- `DISTRIBUTED`: Enable distributed execution
- `FOR GRAPH`: Specify target graph
- `RETURNS`: Specify return type for subqueries
- `SYNTAX v3`: Use GSQL V3 syntax (GQL-compatible)

### CREATE VERTEX Syntax

```gsql
CREATE VERTEX vertex_type_name (
  PRIMARY_ID id_name id_type,
  attribute_name type [DEFAULT default_value],
  ...
) [WITH vertex_options]
```

**Primary Key Options:**

1. **PRIMARY_ID** (default):
```gsql
CREATE VERTEX Movie (PRIMARY_ID id UINT, name STRING, year UINT)
```

2. **PRIMARY_ID with attribute access**:
```gsql
CREATE VERTEX Movie (PRIMARY_ID id UINT, name STRING, year UINT) 
WITH primary_id_as_attribute="true"
```

3. **PRIMARY KEY**:
```gsql
CREATE VERTEX Movie (id UINT PRIMARY KEY, name STRING, year UINT)
```

4. **Composite PRIMARY KEY**:
```gsql
CREATE VERTEX Movie (id UINT, title STRING, year UINT, PRIMARY KEY (title, year, id))
```

**Vertex Options:**
- `WITH STATS="outdegree_by_edgetype"` (default): Record outdegree statistics
- `WITH STATS="none"`: No degree statistics
- `WITH primary_id_as_attribute="true"`: Make ID accessible as attribute

### CREATE EDGE Syntax

```gsql
CREATE [DIRECTED|UNDIRECTED] EDGE edge_type_name (
  FROM vertex_type [, TO vertex_type] [| FROM vertex_type, TO vertex_type]*,
  [DISCRIMINATOR (attribute_name type, ...)],
  attribute_name type [DEFAULT default_value],
  ...
) [WITH REVERSE_EDGE="reverse_name"]
```

**Examples:**

```gsql
CREATE DIRECTED EDGE transfer (
  FROM Account, TO Account, 
  DISCRIMINATOR(date DATETIME), 
  amount UINT
) WITH REVERSE_EDGE="transfer_reverse"

CREATE UNDIRECTED EDGE hasPhone (FROM Account, TO Phone)

CREATE DIRECTED EDGE isLocatedIn (FROM Account, TO City)
```

**Key Features:**
- `DISCRIMINATOR`: Allows multiple edges of same type between two vertices
- `WITH REVERSE_EDGE`: Automatically creates reverse edge
- Multiple FROM/TO pairs: One edge type can connect multiple vertex type pairs

### CREATE GRAPH Syntax

```gsql
CREATE GRAPH graph_name (vertex_types_and_edge_types)
```

**Examples:**

```gsql
CREATE GRAPH financialGraph (*)  // Include all types
CREATE GRAPH MyGraph (Account, City, Phone, transfer, hasPhone, isLocatedIn)
CREATE GRAPH EmptyGraph ()  // Empty graph, add types later
```

### SELECT Statement Syntax (V3)

**Basic Structure:**

```gsql
vertex_set = SELECT vertex_alias
  FROM pattern
  [WHERE condition]
  [ACCUM statements]
  [POST-ACCUM statements]
  [HAVING condition]
  [ORDER BY expr [ASC|DESC]]
  [LIMIT count [OFFSET offset]]
```

**1-Block SELECT (Ad-hoc queries):**

```gsql
SELECT output_variable FROM pattern WHERE condition [additional_clauses]
```

**LET...IN SELECT:**

```gsql
LET
  variable_definitions;
IN
  SELECT query_block
```

## GSQL_PATTERNS

### Node Pattern

**Basic Syntax:**
```gsql
(alias:VertexType)
(alias:VertexType|OtherType)
(alias:VertexType {attribute: value})
(alias:VertexType WHERE condition)
```

**Examples:**

```gsql
// Select all Account vertices
v = SELECT a FROM (a:Account);

// Select Account with filter
v = SELECT a FROM (a:Account) WHERE a.name == "Scott";

// Select Account with JSON-style filter
v = SELECT a FROM (a:Account {name: "Scott"});

// Select from vertex set variable
v = SELECT a FROM (a:v) WHERE a.name == "Scott";
```

### Edge Pattern

**Basic Syntax:**
```gsql
(alias1:VertexType) -[edge_alias:EdgeType]-> (alias2:VertexType)
(alias1:VertexType) <-[edge_alias:EdgeType]- (alias2:VertexType)
(alias1:VertexType) ~[edge_alias:EdgeType]~ (alias2:VertexType)  // Undirected
```

**Edge Orientation:**

| Orientation | Example |
|------------|---------|
| Directed Right | `-[e:transfer]->` |
| Directed Left | `<-[e:transfer]-` |
| Undirected | `~[e:hasPhone]~` |
| Left or Right | `<-[e:transfer]->` |
| Any Direction | `-[e:transfer]-` |

**Examples:**

```gsql
// 1-hop edge pattern
v = SELECT b 
    FROM (a:Account {name: acctName})-[e:transfer]->(b:Account)
    ACCUM b.@totalTransfer += e.amount;

// Multiple edge types
v = SELECT t 
    FROM (s:Account)-[e:transfer|isLocatedIn]->(t)
    WHERE e.amount > 100;
```

### Path Pattern

**Fixed Length Path:**

```gsql
// 2-hop path
R = SELECT b 
    FROM (a:Account)-[e:transfer]->()-[e2:transfer]->(b:Account)
    WHERE e.date >= low AND e.date <= high;
```

**Variable Length Path:**

**GQL Style Quantifiers:**
- `{m,n}`: between m and n repetitions
- `{m,}`: m or more repetitions
- `*`: 0 or more (equivalent to {0,})
- `+`: 1 or more (equivalent to {1,})

**GSQL Style Quantifiers:**
- `*m..n`: between m and n repetitions
- `*m..`: m or more repetitions
- `*..n`: 0 to n repetitions
- `*n`: exactly n repetitions

**Examples:**

```gsql
// Variable length path (1 to unlimited hops)
R = SELECT b 
    FROM (a:Account {name: acctName})-[:transfer*1..]->(b:Account);

// Variable length path (1 to 3 hops)
R = SELECT b 
    FROM (a:Account)-[:transfer*1..3]->(b:Account);

// Shortest path semantics
R = SELECT b 
    FROM (a:Account)-[:transfer*1..]->(b:Account)
    GROUP BY a, b;
```

**Important Notes:**
- Variable length paths use shortest path semantics
- Cannot bind edge alias in variable length part
- Can bind endpoints and group by them

### Pattern Restrictions

**Conjunctive Patterns:**

```gsql
// Multiple patterns must all be satisfied
SELECT t 
FROM (p:Person {name:"Paul Erdos"})-[:coauthor*1..3]->(t:Person),
     (k:Person {name:"Kevin Bacon"})-[:worked_with*1..3]->(t:Person)
```

## GSQL_ACCUMULATORS

### Accumulator Types

**Local Accumulators (prefixed with `@`):**
- `SumAccum<type>`: Sum of values
- `MaxAccum<type>`: Maximum value
- `MinAccum<type>`: Minimum value
- `AvgAccum`: Average value
- `OrAccum`: Logical OR
- `AndAccum`: Logical AND
- `ListAccum<type>`: Ordered list
- `SetAccum<type>`: Unordered unique set
- `BagAccum<type>`: Unordered multiset
- `MapAccum<key_type, value_type>`: Key-value map
- `HeapAccum<tuple_type>(size, sort_key)`: Priority heap

**Global Accumulators (prefixed with `@@`):**
- Same types as local accumulators
- Shared across entire query

**Edge-Attached Accumulators:**
- Primitive accumulators can be attached to edges
- Syntax: `OrAccum EDGE @visited`

### Accumulator Operators

**Assignment (`=`):**
```gsql
@@sum_accum = 0;  // Reset accumulator
```

**Accumulation (`+=`):**
```gsql
@@sum_accum += 1;  // Add to accumulator
a.@totalTransfer += e.amount;  // Local accumulator
```

### Global vs Local Accumulators

**Global Accumulator:**
```gsql
SumAccum<INT> @@hasPhoneCnt = 0;  // Global
S = SELECT a 
    FROM (a:Account)~[e:hasPhone]~(p:Phone)
    ACCUM @@hasPhoneCnt += 1;  // Update global
PRINT @@hasPhoneCnt;
```

**Local Accumulator:**
```gsql
SumAccum<INT> @cnt = 0;  // Local
S = SELECT a 
    FROM (a:Account)~[e:hasPhone]~(p:Phone)
    ACCUM a.@cnt += 1,  // Update local accumulator
          p.@cnt += 1;
PRINT S;  // Shows @cnt for each vertex
```

### ACCUM vs POST-ACCUM

**ACCUM Clause:**
- Executes once per matched pattern instance
- Uses snapshot semantics (map-reduce)
- Can update accumulators and edge attributes
- Cannot update vertex attributes directly

**POST-ACCUM Clause:**
- Executes once per distinct vertex in result set
- Can access aggregated accumulator values from ACCUM
- Can update vertex attributes
- Loops through vertex set

**Example:**

```gsql
SumAccum<INT> @cnt = 0;
SumAccum<INT> @@testCnt1 = 0;
SumAccum<INT> @@testCnt2 = 0;

S = SELECT a 
    FROM (a:Account)~[e:hasPhone]~(p:Phone)
    WHERE a.isBlocked == TRUE
    ACCUM a.@cnt += 1,           // Snapshot value is 0
          @@testCnt1 += a.@cnt   // Accesses snapshot value 0
    POST-ACCUM (a)
          @@testCnt2 += a.@cnt;  // Accesses new value 1

PRINT @@testCnt1, @@testCnt2, S;
```

**Key Differences:**
- ACCUM: Per pattern match, snapshot semantics
- POST-ACCUM: Per vertex, accesses aggregated values
- Multiple POST-ACCUM clauses allowed, each bound to one vertex alias

### Edge-Attached Accumulators

```gsql
OrAccum EDGE @visited;

v = SELECT b 
    FROM (a:Account {name: acctName})-[e:transfer]->(b:Account)
    ACCUM e.@visited += TRUE;

v = SELECT b 
    FROM (a:Account)-[e:transfer]->(b:Account)
    WHERE NOT e.@visited;
```

**Note:** Edge-attached accumulators only supported in single-node mode or single-node mode in distributed environment.

## GSQL_CONTROL_FLOW

### IF Statement

**Syntax:**
```gsql
IF condition1 THEN statement(s)
[ELSE IF condition2 THEN statement(s)]
[ELSE statement(s)]
END
```

**Example:**

```gsql
S1 = SELECT a 
     FROM (a:Account)
     ACCUM
           IF a.isBlocked THEN @@isBlocked += 1
           ELSE IF NOT a.isBlocked THEN @@unBlocked += 1
           ELSE @@others += 1
           END;

// Top-level IF
IF drink == "Juice" THEN @@calories += 50;
ELSE IF drink == "Soda" THEN @@calories += 120;
ELSE @@calories = 0;
END;
```

### WHILE Statement

**Syntax:**
```gsql
WHILE condition [LIMIT maxIter] DO
    statement(s)
END
```

**Example:**

```gsql
OrAccum @visited;
reachable_vertices = {};
visited_vertices (ANY) = {seed};

WHILE visited_vertices.size() != 0 DO
    visited_vertices = SELECT s
                      FROM (:visited_vertices)-[:transfer]->(s)
                      WHERE s.@visited == FALSE
                      POST-ACCUM s.@visited = TRUE;
    reachable_vertices = reachable_vertices UNION visited_vertices;
END;

// With LIMIT
WHILE visited_vertices.size() != 0 LIMIT 2 DO
    // statements
END;
```

### FOREACH Statement

**Syntax:**
```gsql
FOREACH loop_var IN rangeExpr DO
   statements
END
```

**Range Expressions:**
- `name IN setBagExpr`: Iterate over collection
- `(key, value) IN mapExpr`: Iterate over map
- `name IN RANGE [expr, expr]`: Numeric range
- `name IN RANGE [expr, expr].STEP(expr)`: Range with step

**Examples:**

```gsql
// Loop over list
FOREACH i IN @@listVar DO
    @@set1 += i;
END;

// Loop over set
FOREACH i IN @@setVar DO
    @@set2 += i;
END;

// Loop over map
FOREACH (keyI, valueJ) IN @@mapVar DO
    @@mapVarResult += (keyI -> valueJ);
END;

// Numeric range
FOREACH k IN RANGE[-1,4].STEP(2) DO
    @@st += k;
END;

// Nested loops
FOREACH i IN RANGE[0, 2] DO
    @@t += i;
    S = SELECT s 
        FROM (s:Account)
        WHERE s.name == "Scott"
        ACCUM
            FOREACH j IN RANGE[0, i] DO
                @@t += j
            END;
END;
```

### CONTINUE and BREAK

**CONTINUE:** Skip remaining statements in current iteration, proceed to next iteration

**BREAK:** Exit the loop immediately

**Example:**

```gsql
INT i = 0;
WHILE (i < 3) DO
    i = i + 1;
    IF (i == 2) THEN
        CONTINUE;  // Skip to next iteration
    END;
    PRINT i;  // Output: 1, 3
END;

i = 0;
WHILE (i < 3) DO
    i = i + 1;
    IF (i == 2) THEN
        BREAK;  // Exit loop
    END;
    PRINT i;  // Output: 1
END;
```

### CASE WHEN Statement

**IF-ELSE Semantics:**
```gsql
CASE
  WHEN condition1 THEN statement(s)
  WHEN condition2 THEN statement(s)
  ...
  ELSE statement(s)
END
```

**Switch Semantics:**
```gsql
CASE expr
  WHEN constant1 THEN statement(s)
  WHEN constant2 THEN statement(s)
  ...
  ELSE statement(s)
END
```

**Examples:**

```gsql
// IF-ELSE version
S1 = SELECT a 
     FROM (a:Account)
     ACCUM
          CASE
            WHEN a.isBlocked THEN @@isBlocked += 1
            WHEN NOT a.isBlocked THEN @@unBlocked += 1
            ELSE @@others += 1
          END;

// Switch version
S2 = SELECT a 
     FROM (a:Account)
     ACCUM
          CASE a.isBlocked
            WHEN TRUE THEN @@isBlocked2 += 1
            WHEN FALSE THEN @@unBlocked2 += 1
            ELSE @@others2 += 1
          END;

// Top-level CASE
CASE
  WHEN drink == "Juice" THEN @@calories += 50;
  WHEN drink == "Soda" THEN @@calories += 120;
  ELSE @@calories = 0;
END;
```

## GSQL_DATA_TYPES

### Primitive Types

| Type | Default | Range/Precision | Description |
|------|---------|----------------|-------------|
| `INT` | 0 | -2^63 to 2^63-1 | 8-byte signed integer |
| `UINT` | 0 | 0 to 2^64-1 | 8-byte unsigned integer |
| `FLOAT` | 0.0 | ±3.4E±38, ~7 decimal digits | 4-byte single-precision |
| `DOUBLE` | 0.0 | ±1.7E±308, ~16 decimal digits | 8-byte double-precision |
| `BOOL` | false | true/false | Boolean |
| `STRING` | "" | UTF-8, no max length | Character string |
| `DATETIME` | UTC time 0 | 1582-10-15 to 9999-12-31 | Date and time (UTC) |

### Collection Types

**LIST:**
```gsql
LIST<INT> myList = [1, 2, 3];
LIST<STRING> names = ["Alice", "Bob"];
```

**SET:**
```gsql
SET<INT> mySet = (1, 2, 3);
SET<STRING> uniqueNames = ("Alice", "Bob");
```

**MAP:**
```gsql
MAP<STRING, INT> myMap;
myMap += ("key1" -> 10);
myMap += ("key2" -> 20);
```

### Graph Types

**VERTEX:**
```gsql
VERTEX<Account> v;
VERTEX v;  // Any vertex type
```

**EDGE:**
```gsql
EDGE<transfer> e;
EDGE e;  // Any edge type
```

### User-Defined Tuples (UDT)

**Definition:**
```gsql
TYPEDEF TUPLE<field1 INT(1), field2 UINT, field3 STRING(10), field4 DOUBLE> My_Tuple
```

**Usage:**
```gsql
My_Tuple t = (1, 2, "test", 3.14);
```

## GSQL_FUNCTIONS

### String Functions

- `gsql_length(str)`: Length of string
- `gsql_substring(str, start, length)`: Substring
- `gsql_upper(str)`: Convert to uppercase
- `gsql_lower(str)`: Convert to lowercase
- `gsql_concat(str1, str2)`: Concatenate strings
- `gsql_find(str, substr)`: Find substring
- `gsql_replace(str, old, new)`: Replace substring
- `gsql_trim(str)`: Trim whitespace
- `SPLIT(str, delimiter)`: Split string into list
- `toString(expr)`: Convert to string

### Mathematical Functions

- `abs(x)`: Absolute value
- `sqrt(x)`: Square root
- `pow(x, y)`: Power
- `log(x)`: Natural logarithm
- `exp(x)`: Exponential
- `floor(x)`: Floor function
- `ceil(x)`: Ceiling function
- `round(x)`: Round to nearest integer
- `sin(x)`, `cos(x)`, `tan(x)`: Trigonometric functions

### Aggregation Functions

- `COUNT(*)`: Count all
- `COUNT(expr)`: Count non-null values
- `COUNT(DISTINCT expr)`: Count distinct values
- `SUM(expr)`: Sum of values
- `AVG(expr)`: Average
- `MIN(expr)`: Minimum
- `MAX(expr)`: Maximum
- `STDEV(expr)`: Standard deviation

### Vertex Functions

- `outdegree([edge_type])`: Outdegree
- `indegree([edge_type])`: Indegree
- `neighbors([edge_type])`: Get neighbors
- `getNeighbors([edge_type])`: Get neighbors
- `type`: Vertex type name
- `getvid(vertex)`: Get vertex ID

### Edge Functions

- `type`: Edge type name
- `getAttr(attr_name)`: Get attribute value
- `setAttr(attr_name, value)`: Set attribute value

### DateTime Functions

- `now()`: Current datetime
- `to_datetime(str)`: Parse datetime string
- `datetime_to_epoch(dt)`: Convert to epoch seconds
- `epoch_to_datetime(epoch)`: Convert from epoch
- `year(dt)`, `month(dt)`, `day(dt)`: Extract components
- `hour(dt)`, `minute(dt)`, `second(dt)`: Extract time components

### Type Conversion Functions

- `to_string(expr)`: Convert to string
- `to_int(expr)`: Convert to integer
- `to_float(expr)`: Convert to float
- `to_bool(expr)`: Convert to boolean
- `to_datetime(expr)`: Convert to datetime
- `gsql_to_bool(str)`: Parse boolean string

## GSQL_EXAMPLES_BY_PATTERN

### 1-Block SELECT Examples

**Basic SELECT:**
```gsql
GSQL> SELECT s FROM (s:Account) LIMIT 10
GSQL> SELECT s FROM (s:Account {name: "Scott"})
GSQL> SELECT s FROM (s:Account) WHERE s.isBlocked
GSQL> SELECT s FROM (s:Account) WHERE s.name IN ("Scott", "Steven")
```

**Aggregation:**
```gsql
GSQL> SELECT COUNT(*) FROM (s:Account)
GSQL> SELECT COUNT(DISTINCT t) FROM (s:Account)-[e]->(t)
GSQL> SELECT a, sum(e.amount) as amount1, sum(e2.amount) as amount2 
      FROM (a:Account)-[e:transfer]->(b:Account)-[e2:transfer]->(c:Account) 
      GROUP BY a
```

**With Variables:**
```gsql
GSQL> BEGIN
GSQL> LET
GSQL>   DOUBLE a = 500.0;
GSQL>   STRING b = "Jenny";
GSQL> IN
GSQL>   SELECT s, e.amount AS amt, t
GSQL>   FROM (s:Account)-[e:transfer]->(t:Account)
GSQL>   WHERE s.isBlocked = false AND t.name <> b
GSQL>   HAVING amt > a
GSQL> END
```

**With Accumulators:**
```gsql
GSQL> BEGIN
GSQL> LET
GSQL>   SetAccum<string> @transferNames;
GSQL> IN
GSQL>   SELECT s FROM (s:Account WHERE s.isBlocked)-[:transfer*1..3]-(t:Account)
GSQL>   ACCUM s.@transferNames += t.name
GSQL> END
```

### Stored Procedure Examples

**Node Pattern:**
```gsql
CREATE OR REPLACE QUERY q1a() SYNTAX v3 {
  v = SELECT a FROM (a:Account);
  PRINT v;
  
  v = SELECT a FROM (a:v) WHERE a.name == "Scott";
  PRINT v;
}
```

**Edge Pattern:**
```gsql
CREATE OR REPLACE QUERY q2a(string acctName) SYNTAX v3 {
  SumAccum<int> @totalTransfer = 0;
  
  v = SELECT b 
      FROM (a:Account {name: acctName})-[e:transfer]->(b:Account)
      ACCUM b.@totalTransfer += e.amount;
  
  PRINT v;
}
```

**Path Pattern:**
```gsql
CREATE OR REPLACE QUERY q3a(datetime low, datetime high, string acctName) SYNTAX v3 {
  R = SELECT b 
      FROM (a:Account WHERE a.name== acctName)-[e:transfer]->()-[e2:transfer]->(b:Account)
      WHERE e.date >= low AND e.date <= high AND e.amount > 500 AND e2.amount > 500;
  PRINT R;
  
  R = SELECT b 
      FROM (a:Account WHERE a.name == acctName)-[:transfer*1..]->(b:Account);
  PRINT R;
}
```

**Table Style SELECT:**
```gsql
CREATE OR REPLACE QUERY q2b() SYNTAX v3 {
  SELECT a, b, sum(e.amount) INTO T
  FROM (a:Account)-[e:transfer]->(b:Account)
  GROUP BY a, b;
  PRINT T;
}
```

## GSQL_LOADING_JOBS

### CREATE LOADING JOB Syntax

```gsql
CREATE LOADING JOB job_name [FOR GRAPH graph_name] {
  DEFINE FILENAME filename_var = "path/to/file";
  
  LOAD filename_var TO VERTEX vertex_type VALUES (
    $"column_name" [AS attribute_name],
    ...
  ) USING header="true|false", separator=",";
  
  LOAD filename_var TO EDGE edge_type VALUES (
    $"source_column",
    $"target_column",
    $"attribute_column",
    ...
  ) USING header="true|false", separator=",";
}
```

### Example Loading Job

```gsql
USE GRAPH financialGraph

CREATE LOADING JOB load_local_file {
  DEFINE FILENAME account="/home/tigergraph/data/account.csv";
  DEFINE FILENAME phone="/home/tigergraph/data/phone.csv";
  DEFINE FILENAME city="/home/tigergraph/data/city.csv";
  DEFINE FILENAME hasPhone="/home/tigergraph/data/hasPhone.csv";
  DEFINE FILENAME locatedIn="/home/tigergraph/data/locate.csv";
  DEFINE FILENAME transferdata="/home/tigergraph/data/transfer.csv";
  
  LOAD account TO VERTEX Account VALUES (
    $"name", 
    gsql_to_bool(gsql_trim($"isBlocked"))
  ) USING header="true", separator=",";
  
  LOAD phone TO VERTEX Phone VALUES (
    $"number", 
    gsql_to_bool(gsql_trim($"isBlocked"))
  ) USING header="true", separator=",";
  
  LOAD city TO VERTEX City VALUES ($"name") 
  USING header="true", separator=",";
  
  LOAD hasPhone TO EDGE hasPhone VALUES (
    $"accnt", 
    gsql_trim($"phone")
  ) USING header="true", separator=",";
  
  LOAD locatedIn TO EDGE isLocatedIn VALUES (
    $"accnt", 
    gsql_trim($"city")
  ) USING header="true", separator=",";
  
  LOAD transferdata TO EDGE transfer VALUES (
    $"src", 
    $"tgt", 
    $"date", 
    $"amount"
  ) USING header="true", separator=",";
}

RUN LOADING JOB load_local_file
```

### Vector Attribute Loading

```gsql
CREATE LOADING JOB load_emb {
  DEFINE FILENAME file1;
  LOAD file1 TO VERTEX Account VALUES ($1, $2) USING SEPARATOR="|";
  LOAD file1 TO VECTOR ATTRIBUTE emb1 ON VERTEX Account VALUES (
    $1, 
    SPLIT($3, ",")
  ) USING SEPARATOR="|", HEADER="false";
}
```

## GSQL_SCHEMA_DESIGN

### Vertex Design Best Practices

1. **Choose Appropriate Primary Key:**
   - Use `PRIMARY_ID` for compact storage
   - Use `PRIMARY KEY` if ID needs to be accessed as attribute
   - Use composite keys only when necessary

2. **Attribute Design:**
   - Use appropriate data types
   - Set DEFAULT values when appropriate
   - Consider indexing frequently queried attributes

3. **Statistics Options:**
   - Use `STATS="outdegree_by_edgetype"` for queries needing degree info
   - Use `STATS="none"` to save memory if degree info not needed

### Edge Design Best Practices

1. **Direction:**
   - Use DIRECTED for asymmetric relationships
   - Use UNDIRECTED for symmetric relationships

2. **Discriminators:**
   - Use DISCRIMINATOR when multiple edges of same type needed between vertices
   - Only INT, UINT, DATETIME, STRING allowed as discriminators

3. **Reverse Edges:**
   - Use `WITH REVERSE_EDGE` for efficient backward traversal
   - Automatically maintained by system

### Index Management

```gsql
CREATE GLOBAL SCHEMA_CHANGE JOB add_index {
  ALTER VERTEX User ADD INDEX user_country_index ON (country);
}

CREATE GLOBAL SCHEMA_CHANGE JOB drop_index {
  ALTER VERTEX User DROP INDEX user_country_index;
}
```

**Index Guidelines:**
- Create indexes on frequently queried attributes
- Only STRING, UINT, INT, DATETIME can be indexed
- Indexes improve read performance but affect write performance

## GSQL_ADVANCED_FEATURES

### Vector Search

**Vector Attribute Definition:**
```gsql
CREATE GLOBAL SCHEMA_CHANGE JOB add_vector {
  ALTER VERTEX Account ADD VECTOR ATTRIBUTE emb1(DIMENSION=3, METRIC="COSINE");
}
```

**Vector Search Function:**
```gsql
CREATE QUERY vector_search(List<DOUBLE> query_vector) SYNTAX v3 {
  v = SELECT s 
      FROM (s:Account)
      WHERE vectorSearch(s.emb1, query_vector, 3)  // Top 3 similar
      ACCUM @@results += s;
  PRINT @@results;
}
```

**Vector Metrics:**
- `COSINE`: Cosine similarity (default)
- `L2`: Euclidean distance
- `IP`: Inner product

### OpenCypher Query

**Basic Syntax:**
```gsql
CREATE OR REPLACE OPENCYPHER QUERY c1() {
  MATCH (a:Account)
  RETURN a
}
```

**Pattern Matching:**
```gsql
CREATE OR REPLACE OPENCYPHER QUERY c3(string accntName) {
  MATCH (a:Account {name: $accntName})-[e:transfer]->(b:Account)
  RETURN b, sum(e.amount) AS totalTransfer
}
```

**Variable Length Path:**
```gsql
CREATE OR REPLACE OPENCYPHER QUERY c6(string accntName) {
  MATCH (a:Account {name: $accntName})-[e:transfer*1..]->(b:Account)
  RETURN a, b
}
```

### Virtual Edge

**Create Virtual Edge:**
```gsql
CREATE OR REPLACE DISTRIBUTED QUERY VirtualEdgeQuery() SYNTAX v2 {
  CREATE DIRECTED VIRTUAL EDGE VirtualE1(FROM City, TO Phone, ts datetime);
  
  v = SELECT c 
      FROM Phone:b-(hasPhone)-Account-(isLocatedIn>)-City:c
      ACCUM INSERT INTO VirtualE1 VALUES(c, b, to_datetime("2025-02-13"));
  
  ListAccum<String> @@result;
  v = SELECT p 
      FROM City:c-(VirtualE1>)-Phone:p
      ACCUM @@result += c.name + "->" + to_string(p.number);
  
  PRINT @@result;
}
```

**Note:** Virtual edges require DISTRIBUTED keyword and SYNTAX v2.

### Distributed Query Mode

**Enable Distributed Execution:**
```gsql
CREATE OR REPLACE DISTRIBUTED QUERY q4() SYNTAX v3 {
  // Query body
}
```

**Benefits:**
- Parallel execution across cluster
- Better performance for large graphs
- Automatic load balancing

## GSQL_BEST_PRACTICES

### Performance Optimization

1. **Use Appropriate Accumulators:**
   - Use local accumulators for per-vertex aggregation
   - Use global accumulators for cross-vertex aggregation
   - Choose right accumulator type (Sum vs Max vs List)

2. **Filter Early:**
   - Use WHERE clause to filter before ACCUM
   - Reduce number of pattern matches processed

3. **Limit Traversal Depth:**
   - Use LIMIT on variable length paths
   - Avoid unbounded traversals

4. **Batch Processing:**
   - For large seed sets, use batch processing to avoid OOM
   - Partition seed set and process in batches

**Batch Processing Example:**
```gsql
CREATE OR REPLACE QUERY BatchCount(INT batch_num) SYNTAX v3 {
  SumAccum<INT> @@count;
  batch1 = SELECT s 
           FROM (s:Account)
           WHERE getvid(s) % 1000 == batch_num;
  
  tmp = SELECT a1 
        FROM (a1:batch1)-[:transfer]->(b1:Account)-[:transfer]->(a2:Account)-[:transfer]->(b2:batch1)
        WHERE a1.name != a2.name AND b1.name != b2.name
        ACCUM @@count += 1;
  
  PRINT @@count;
}
```

### Code Quality Guidelines

1. **Meaningful Variable Names:**
   - Use descriptive names for vertex sets and accumulators
   - Follow consistent naming conventions

2. **Comments:**
   - Add comments for complex logic
   - Explain non-obvious patterns

3. **Error Handling:**
   - Validate input parameters
   - Handle edge cases (empty sets, null values)

4. **Modularity:**
   - Break complex queries into steps
   - Use subqueries for reusable logic

### Common Patterns

1. **BFS Traversal:**
```gsql
OrAccum @visited;
reachable = {};
current = {start_vertex};

WHILE current.size() > 0 LIMIT max_depth DO
    current = SELECT t 
              FROM (:current)-[:edge_type]->(t)
              WHERE NOT t.@visited
              POST-ACCUM t.@visited = TRUE;
    reachable = reachable UNION current;
END;
```

2. **Aggregation Pattern:**
```gsql
SumAccum<INT> @count;
SumAccum<DOUBLE> @total;

result = SELECT s 
         FROM (s:Source)-[e:Edge]->(t:Target)
         ACCUM s.@count += 1,
               s.@total += e.amount
         POST-ACCUM s.@average = s.@total / s.@count;
```

3. **Composition Pattern:**
```gsql
// First query block
tgtAccnts = SELECT y 
            FROM (x:Account)-[e:transfer]->(y:Account)
            WHERE x.isBlocked == TRUE AND y.isBlocked == FALSE
            ACCUM y.@cnt += 1;

// Second query block uses result from first
tgtPhones = SELECT z 
            FROM (x:tgtAccnts)~[e:hasPhone]~(z:Phone)
            WHERE z.isBlocked
            ACCUM z.@cnt += 1;
```

## GSQL_COMMON_ERRORS

### Syntax Errors

1. **Undefined Variable:**
   - **Error:** Variable not declared before use
   - **Solution:** Declare all variables before use

2. **Type Mismatch:**
   - **Error:** Accumulator type doesn't match usage
   - **Solution:** Ensure accumulator types match operations

3. **Missing Semicolon:**
   - **Error:** Missing semicolon in statement
   - **Solution:** Add semicolon at end of statements

### Runtime Errors

1. **Empty Vertex Set:**
   - **Error:** Operations on empty set
   - **Solution:** Check if vertex set is empty before operations

2. **Out of Memory:**
   - **Error:** Query consumes too much memory
   - **Solution:** Use batch processing, limit traversal depth

3. **Infinite Loop:**
   - **Error:** WHILE loop never terminates
   - **Solution:** Add LIMIT clause or ensure condition becomes false

### Performance Issues

1. **Slow Queries:**
   - **Cause:** Full graph scans, no indexes
   - **Solution:** Add indexes, filter early, use appropriate patterns

2. **High Memory Usage:**
   - **Cause:** Large accumulators, unbounded traversals
   - **Solution:** Use batch processing, limit result sets

### Troubleshooting

**Debug Using PRINT:**
```gsql
PRINT vertex_set[vertex_set.attribute];
PRINT @@global_accumulator;
```

**Debug Using LOG:**
```gsql
LOG(true, "debug message", variable_value);
```

**Check Logs:**
```bash
gadmin log gpe  # Find log location
vim /home/tigergraph/tigergraph/log/gpe/log.INFO
```

## GSQL_DML_OPERATIONS

### Update Attribute

```gsql
CREATE OR REPLACE QUERY updateAttribute() SYNTAX v3 {
  v1 = SELECT a 
       FROM (a:Account)-[e:transfer]->(b:Account)
       WHERE a.name == "Scott";
  PRINT v1;
  
  v2 = SELECT a 
       FROM (a:Account)-[e:transfer]->(b:Account)
       WHERE a.name == "Scott"
       ACCUM e.amount = e.amount + 1  // Increment edge attribute
       POST-ACCUM (a)
             CASE WHEN NOT a.isBlocked THEN a.isBlocked = TRUE END;
}
```

**Note:** Updates have snapshot semantics - visible after query completes.

### Insert Edge

```gsql
CREATE OR REPLACE QUERY insertEdge() SYNTAX v3 {
  DATETIME date = now();
  v1 = SELECT a 
       FROM (a:Account)-[e:transfer]->()-[e2:transfer]->(t)
       WHERE a.name == "Scott"
       ACCUM INSERT INTO transfer VALUES (a.name, t.name, date, 10);
}
```

### Delete Element

**DELETE Statement:**
```gsql
CREATE OR REPLACE QUERY deleteElement() SYNTAX v3 {
  DELETE a FROM (a:Account) WHERE a.name == "Scott";
  DELETE e FROM (a:Account)-[e:transfer]->(t) WHERE a.name == "Jenny";
}
```

**DELETE() Function:**
```gsql
CREATE OR REPLACE QUERY deleteElement2() SYNTAX v3 {
  v = SELECT a 
      FROM (a:Account)
      WHERE a.name == "Paul"
      ACCUM DELETE(a);  // Delete vertex
  
  v = SELECT a 
      FROM (a:Account)-[e:transfer]-(t)
      WHERE a.name == "Ed"
      ACCUM DELETE(e);  // Delete edge
}
```

## GSQL_VERTEX_SET_OPERATIONS

### Union

```gsql
S1 = SELECT s FROM (s:Phone) WHERE s.number == "111" OR s.number == "222";
S2 = SELECT s FROM (s:Phone) WHERE s.number == "222";
S3 = S1 UNION S2;  // Removes duplicates
PRINT S3;
```

### Intersect

```gsql
S1 = SELECT s FROM (s:Phone) WHERE s.number == "111" OR s.number == "222";
S2 = SELECT s FROM (s:Phone) WHERE s.number == "222";
S3 = S1 INTERSECT S2;  // Common vertices
PRINT S3;
```

### Minus

```gsql
S1 = SELECT s FROM (s:Phone) WHERE s.number == "111" OR s.number == "222";
S2 = SELECT s FROM (s:Phone) WHERE s.number == "222";
S3 = S1 MINUS S2;  // S1 - S2
PRINT S3;
```

## GSQL_EXPERIMENTAL_FEATURES

### Table Operations

**SELECT INTO TABLE:**
```gsql
SELECT s.name AS acct, SUM(e.amount) AS totalAmt INTO T1
FROM (s:Account)-[e:transfer]->(t:Account)
WHERE NOT s.isBlocked
HAVING totalAmt > 1000
ORDER BY totalAmt DESC
LIMIT 5 OFFSET 0;
PRINT T1;
```

**INIT Table:**
```gsql
INIT T1 1 AS col_1, true AS col_2, [0.1, -1.1] AS col_3;
PRINT T1;
```

**ORDER Table:**
```gsql
ORDER T1 BY maxTransferAmt DESC, acct LIMIT 3 OFFSET 1 * page;
```

**FILTER Table:**
```gsql
FILTER T ON srcAccount == "Scott" OR amt > 10000;
FILTER T ON srcAccount != "Scott";
```

**PROJECT Table:**
```gsql
PROJECT T1 ON
   T1.srcAccount + ":" + T1.phoneNumber AS acct,
   T1.amt * 2 AS doubleAmt,
   T1.amt % 7 AS mod7Amt,
   T1.amt > 10000 AS flag
INTO T2;
```

**JOIN Operations:**
```gsql
// INNER JOIN
JOIN T1 t1 WITH T2 t2
  ON t1.srcAccount == t2.name
PROJECT
  t1.srcAccount + ":" + t2.phoneNumber AS acct,
  t1.amt AS totalAmt
INTO T3;

// LEFT JOIN
LEFT JOIN T1 t1 WITH T2 t2
  ON t1.srcAccount == t2.name
PROJECT
  t1.srcAccount AS acct,
  t2.phoneNumber AS phoneNum,
  t1.amt AS totalAmt
INTO T3;

// SEMIJOIN
SEMIJOIN T1 t1 WITH T2 t2
  ON t1.srcAccount == t2.name
PROJECT
  t1.srcAccount AS acct,
  t1.amt AS totalAmt
INTO T3;
```

**UNION Table:**
```gsql
UNION T1 WITH T2 INTO T3;  // Removes duplicates
UNION ALL T1 WITH T2 INTO T3;  // Keeps duplicates
```

**UNWIND:**
```gsql
// Expand fixed list
UNWIND [0.9, 1.0, 1.1] AS ratio INTO T1;

// Expand list column per row
UNWIND T1 ON ratioList AS ratio INTO T2;
```

**Note:** Table operations are experimental and work on single machine, compiled mode only.

## GSQL_USE_CASE_EXAMPLES

### Social Network Analysis

**Friends of Friends:**
```gsql
CREATE OR REPLACE DISTRIBUTED QUERY friendsOfFriends(VERTEX<Person> personId) SYNTAX v3 {
  SetAccum<vertex<Person>> @@friendsOfFriends;
  
  Start = {personId};
  Friends = SELECT t FROM Start:s-(FRIENDS)->Person:t
            ACCUM @@friendsOfFriends += t;
  
  FriendsOfFriends = SELECT t 
                     FROM Friends:s-(FRIENDS)->Person:t
                     WHERE t != personId AND t NOT IN @@friendsOfFriends
                     ACCUM @@friendsOfFriends += t;
  
  PRINT @@friendsOfFriends;
}
```

### Recommendation Systems

**Collaborative Filtering:**
```gsql
CREATE OR REPLACE QUERY recommend(STRING userId) SYNTAX v3 {
  SumAccum<INT> @similarity;
  SetAccum<STRING> @userItems;
  
  // Get user's items
  userItems = SELECT t 
              FROM (s:User {id: userId})-[e:RATED]->(t:Item)
              ACCUM s.@userItems += t.id;
  
  // Find similar users
  similarUsers = SELECT t 
                 FROM (s:User {id: userId})-[e1:RATED]->(i:Item)<-[e2:RATED]-(t:User)
                 WHERE t.id != userId
                 ACCUM t.@similarity += 1;
  
  // Recommend items from similar users
  recommendations = SELECT i 
                    FROM (s:similarUsers)-[e:RATED]->(i:Item)
                    WHERE i.id NOT IN userItems.@userItems
                    ACCUM i.@score += s.@similarity
                    ORDER BY i.@score DESC
                    LIMIT 10;
  
  PRINT recommendations;
}
```

### Fraud Detection

**Multi-hop Pattern Analysis:**
```gsql
CREATE OR REPLACE DISTRIBUTED QUERY fraudDetection(STRING accountId) SYNTAX v3 {
  OrAccum @suspicious = FALSE;
  SumAccum<INT> @transactionCount = 0;
  SumAccum<DOUBLE> @totalAmount = 0;
  
  // Analyze 2-hop transaction patterns
  suspiciousAccounts = SELECT t 
                       FROM (s:Account {id: accountId})-[e1:TRANSFER]->(m:Account)-[e2:TRANSFER]->(t:Account)
                       WHERE e1.amount > 10000 AND e2.amount > 10000
                       ACCUM t.@transactionCount += 1,
                             t.@totalAmount += e2.amount
                       HAVING t.@transactionCount > 5 OR t.@totalAmount > 50000
                       POST-ACCUM t.@suspicious = TRUE;
  
  PRINT suspiciousAccounts;
}
```

### Knowledge Graphs

**Semantic Search:**
```gsql
CREATE OR REPLACE QUERY semanticSearch(STRING queryTerm) SYNTAX v3 {
  SetAccum<VERTEX> @@results;
  
  // Find entities related to query term
  entities = SELECT e 
             FROM (e:Entity)
             WHERE e.name == queryTerm OR e.description CONTAINS queryTerm;
  
  // Find related entities through various relationships
  related = SELECT t 
            FROM (s:entities)-[e:RELATED_TO|SIMILAR_TO|PART_OF]->(t:Entity)
            ACCUM @@results += t;
  
  PRINT @@results;
}
```

## GSQL_REST_API

### Running Queries via REST

**Basic Call:**
```bash
curl -u "tigergraph:tigergraph" \
  -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:14240/gsql/v1/queries/query_name?graph=graph_name' \
  -d '{"diagnose":false,"denseMode":false,"allvertex":false,"asyncRun":false,"parameters":{"param1":"value1"}}'
```

**Parameter JSON Object:**
```gsql
CREATE QUERY greet_person(INT age = 3, STRING name = "John", 
  DATETIME birthday = to_datetime("2019-02-19 19:19:19")) {
  PRINT age, name, birthday;
}

INSTALL QUERY greet_person
RUN QUERY greet_person({"name": "Emma", "age": 21})
```

**REST Call:**
```bash
curl -u "tigergraph:tigergraph" \
  -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:14240/gsql/v1/queries/greet_person?graph=financialGraph' \
  -d '{"diagnose":false,"denseMode":false,"allvertex":false,"asyncRun":false,"parameters":{"name":"Emma","age":21}}'
```

## GSQL_QUERY_TUNING_AND_DEBUG

### Batch Processing to Avoid OOM

```gsql
CREATE OR REPLACE QUERY BatchCount(INT batch_num) SYNTAX v3 {
  SumAccum<INT> @@count;
  batch1 = SELECT s 
           FROM (s:Account)
           WHERE getvid(s) % 1000 == batch_num;
  
  tmp = SELECT a1 
        FROM (a1:batch1)-[:transfer]->(b1:Account)-[:transfer]->(a2:Account)-[:transfer]->(b2:batch1)
        WHERE a1.name != a2.name AND b1.name != b2.name
        ACCUM @@count += 1;
  
  PRINT @@count;
}
```

**Shell Script to Run Batches:**
```bash
#!/bin/bash
for i in {0..999}
do
  curl -X GET -H "GSQL-TIMEOUT: 500000" \
    "http://127.0.0.1:9000/query/financialGraph/BatchCount?batch_number=$i"
done
```

### Debug Using PRINT

```gsql
PRINT vertex_set[vertex_set.attribute];
PRINT @@global_accumulator;
PRINT T;  // Table
```

### Debug Using LOG

```gsql
LOG(true, "debug message", variable_value);

// In query block
S = SELECT s 
    FROM (s:Account)
    ACCUM LOG(true, "processing", s.name);
```

**Check Logs:**
```bash
gadmin log gpe  # Find log location
vim /home/tigergraph/tigergraph/log/gpe/log.INFO
```

## GSQL_CATALOG_MANAGEMENT

### Global vs Graph Scope

**Global Scope:**
```gsql
USE GLOBAL
ls  // List all global schema objects
```

**Graph Scope:**
```gsql
USE GRAPH financialGraph
ls  // List schema objects in this graph
```

### SHOW Command

```gsql
SHOW VERTEX Acc*            // All vertices starting with "Acc"
SHOW VERTEX Ac?*t           // Vertices starting with "Ac" and ending with "t"
SHOW VERTEX ?????           // Vertices with 5 letters
SHOW QUERY query_name       // Show query content
SHOW GRAPH graph_name       // List vertices and edges
```

## GSQL_VERSION_COMPATIBILITY

### Syntax Versions

- **V1**: Legacy syntax (deprecated)
- **V2**: Standard GSQL syntax
- **V3**: GQL-compatible syntax (recommended)

**Specify Syntax:**
```gsql
CREATE QUERY q() SYNTAX v3 {
  // V3 syntax
}
```

### Feature Availability

- **1-Block SELECT**: Available since 4.2.0
- **Table Operations**: Experimental, single machine only
- **Virtual Edges**: Require DISTRIBUTED and SYNTAX v2
- **Vector Search**: Available in 4.1+

## GSQL_COMPLETE_EXAMPLE

### End-to-End Example

```gsql
// 1. Create Schema
USE GLOBAL

CREATE VERTEX Account (
  PRIMARY_ID name STRING,
  isBlocked BOOL
) WITH primary_id_as_attribute="true";

CREATE VERTEX City (
  PRIMARY_ID name STRING
);

CREATE DIRECTED EDGE transfer (
  FROM Account, TO Account,
  DISCRIMINATOR(date DATETIME),
  amount UINT
) WITH REVERSE_EDGE="transfer_reverse";

CREATE UNDIRECTED EDGE hasPhone (FROM Account, TO Phone);
CREATE DIRECTED EDGE isLocatedIn (FROM Account, TO City);

CREATE GRAPH financialGraph (*);

// 2. Load Data
USE GRAPH financialGraph

CREATE LOADING JOB load_data {
  DEFINE FILENAME account="/data/account.csv";
  DEFINE FILENAME transfer="/data/transfer.csv";
  
  LOAD account TO VERTEX Account VALUES (
    $"name",
    gsql_to_bool($"isBlocked")
  ) USING header="true", separator=",";
  
  LOAD transfer TO EDGE transfer VALUES (
    $"src", $"tgt", $"date", $"amount"
  ) USING header="true", separator=",";
}

RUN LOADING JOB load_data;

// 3. Create Query
CREATE OR REPLACE DISTRIBUTED QUERY findConnectedAccounts(STRING accountName) SYNTAX v3 {
  SumAccum<INT> @transferCount = 0;
  SumAccum<DOUBLE> @totalAmount = 0;
  
  // Find accounts connected to blocked accounts
  blockedAccounts = SELECT a 
                    FROM (a:Account)
                    WHERE a.isBlocked == TRUE;
  
  connectedAccounts = SELECT t 
                      FROM (s:blockedAccounts)-[e:transfer]->(t:Account)
                      WHERE t.isBlocked == FALSE
                      ACCUM t.@transferCount += 1,
                            t.@totalAmount += e.amount
                      ORDER BY t.@totalAmount DESC
                      LIMIT 10;
  
  PRINT connectedAccounts[connectedAccounts.name, connectedAccounts.@transferCount, connectedAccounts.@totalAmount];
}

INSTALL QUERY findConnectedAccounts;
RUN QUERY findConnectedAccounts("Scott");
```

## GSQL_SCHEMA_CHANGE_OPERATIONS

### CREATE SCHEMA_CHANGE JOB

The `CREATE SCHEMA_CHANGE JOB` block defines a sequence of `ADD`, `ALTER`, and `DROP` statements for changing a particular graph. It does not perform the schema change.

**Syntax:**
```gsql
CREATE SCHEMA_CHANGE JOB job_name FOR GRAPH Graph_Name {
    [sequence of DROP, ALTER, and ADD statements, each line ending with a semicolon]
}
```

**Important Notes:**
- If a `SCHEMA_CHANGE JOB` defines a new edge type which connects to a new vertex type, the `ADD VERTEX` statement should precede the related `ADD EDGE` statement.
- The `ADD EDGE` and `ADD VERTEX` statements can be in the same `SCHEMA_CHANGE JOB`.

### ADD VERTEX | EDGE

The `ADD` statement defines a new type of vertex or edge and automatically adds it to a graph schema. The syntax for the `ADD VERTEX | EDGE` statement is analogous to that of the `CREATE VERTEX | EDGE` statements. It may only be used within a `SCHEMA_CHANGE JOB`.

**Syntax:**
```gsql
ADD VERTEX Vertex_Type_Name ( PRIMARY_ID id_name id_type
    [, attribute_name type [DEFAULT default_value] ]* )
    [WITH [STATS="none"|"outdegree_by_edgetype"][primary_id_as_attribute="true"]]

ADD DIRECTED|UNDIRECTED EDGE Edge_Type_Name (FROM Vertex_Type, TO Vertex_Type
    [, DISCRIMINATOR(attr_list)]
    [, attribute_name type [DEFAULT default_value] ]* )
```

**Example:**
```gsql
CREATE SCHEMA_CHANGE JOB add_reviews FOR GRAPH Book_Rating {
    ADD VERTEX Review (PRIMARY_ID id UINT, review_date DATETIME, url STRING);
    ADD UNDIRECTED EDGE Wrote_Review (FROM User, TO Review);
    ADD UNDIRECTED EDGE Review_Of_Book (FROM Review, TO Book);
}
```

### ALTER VERTEX | EDGE

The `ALTER` statement adds attributes to or removes attributes from an existing vertex type or edge type. It may only be used within a `SCHEMA_CHANGE JOB`.

**ALTER ... ADD Syntax:**
```gsql
ALTER VERTEX Vertex_Type_Name ADD
    ATTRIBUTE (attribute_name type [DEFAULT default_value]
    [',' attribute_name type [DEFAULT default_value]]* );

ALTER EDGE Edge_Type_Name ADD
    [ATTRIBUTE (attribute_name type [DEFAULT default_value]
    [',' attribute_name type [DEFAULT default_value]]* )];
```

**ALTER EDGE ... ADD PAIR:**
```gsql
ALTER EDGE Edge_Type ADD PAIR
    (FROM Vertex_Type, TO Vertex_Type (| FROM Vertex_Type, TO Vertex_Type)* )
```

**ALTER ... DROP Syntax:**
```gsql
ALTER VERTEX|EDGE Object_Type_Name DROP ATTRIBUTE (
    attribute_name [',' attribute_name]* );
```

**Examples:**
```gsql
ALTER VERTEX Company ADD ATTRIBUTE (industry STRING, market_cap DOUBLE);

ALTER EDGE Visit ADD PAIR (FROM Person, TO Company);

ALTER EDGE Has_Pet ADD PAIR (FROM Person, TO Dog | FROM Person, TO Bird);
```

### DROP VERTEX | EDGE

The DROP statement removes the specified vertex type or edge type from the database dictionary. The DROP statement should only be used when graph operations are not in progress.

**Syntax:**
```gsql
DROP VERTEX Vertex_Type_Name [',' Vertex_Type_Name]*
DROP EDGE Edge_Type_Name [',' Edge_Type_Name]*
DROP TUPLE Tuple_Name [',' Tuple_Name]*
```

### RUN SCHEMA_CHANGE JOB

`RUN SCHEMA_CHANGE JOB job_name` performs the schema change job. After the schema has been changed, the GSQL system checks all existing GSQL queries. If an existing GSQL query uses a dropped vertex, edge, or attribute, the query becomes invalid.

**Options:**
- `-warn`: Check for loading job conflicts and ask user before aborting
- `-force`: Automatically abort conflicting loading jobs
- `-N`: Skip query reinstallation (mark queries as invalid, manual reinstall required)

**Example:**
```gsql
RUN SCHEMA_CHANGE JOB add_reviews
RUN SCHEMA_CHANGE JOB add_reviews -warn
RUN SCHEMA_CHANGE JOB add_reviews -N
```

### CREATE GLOBAL SCHEMA_CHANGE JOB

The `CREATE GLOBAL SCHEMA_CHANGE JOB` block defines a sequence of `ADD`, `ALTER`, and `DROP` statements that modify either the attributes or the graph membership of global vertex or edge types.

**Syntax:**
```gsql
CREATE GLOBAL SCHEMA_CHANGE JOB job_name {
    [sequence of global DROP, ALTER, and ADD statements, each line ending with a semicolon]
}
```

**Global vs Local Differences:**
- `ADD` in global: Adds existing global vertex/edge types to a graph's domain
- `ADD` in local: Defines a new local vertex/edge type
- `DROP` in global: Removes global vertex/edge types from a graph's domain
- `DROP` in local: Deletes a local vertex/edge type and its instances
- `ALTER` in global: Modifies global types, may affect several graphs
- `ALTER` in local: Modifies local types only

**Global ADD Syntax:**
```gsql
ADD VERTEX Vertex_Type_Name [',' Vertex_Type_Name...] TO GRAPH Graph_Name;
ADD EDGE Edge_Type_Name [',' Edge_Type_Name...] TO GRAPH Graph_Name;
```

**Global DROP Syntax:**
```gsql
DROP VERTEX Vertex_Type_Name [',' Vertex_Type_Name...] FROM GRAPH Graph_Name;
DROP EDGE Edge_Type_Name [',' Edge_Type_Name...] FROM GRAPH Graph_Name;
```

**Example:**
```gsql
USE GLOBAL
CREATE GLOBAL SCHEMA_CHANGE JOB alter_friendship_make_library {
    ALTER EDGE Friend_Of DROP ATTRIBUTE (on_date);
    ADD VERTEX Book TO GRAPH library;
}
RUN GLOBAL SCHEMA_CHANGE JOB alter_friendship_make_library
```

### Side Effects of Schema Change

- A schema change will invalidate any loading jobs or queries which relate to an altered part of the schema
- Invalid loading jobs are moved to the `disabled` state (beginning with 4.2)
- Invalid queries are uninstalled
- Load or query operations which begin before the schema change will be completed based on the pre-change schema
- Load or query operations which begin after the schema change will be completed based on the post-change schema

### Dynamic Schema Change

Dynamic Schema Change (DSC) acts as a traffic manager for schema change jobs:
- If there are active loading jobs in progress when a schema change is requested, DSC should pause the schema change until the loading job completes
- DSC enables a modest amount of database activity during a schema change, but ONLY if those operations do not involve graph elements affected by the schema change
- For maximum safety, halt all graph activity before and during a schema change

## GSQL_ADVANCED_LOADING_FEATURES

### DEFINE HEADER

The `DEFINE HEADER` statement defines a sequence of column names for an input data file. The first column name maps to the first column, the second column name maps to the second column, etc.

**Syntax:**
```gsql
DEFINE HEADER header_name = "column_name" [," column_name "]*;
```

**Example:**
```gsql
CREATE LOADING JOB load_data FOR GRAPH MyGraph {
    DEFINE HEADER person_header = "id", "name", "age";
    DEFINE FILENAME f;
    LOAD f TO VERTEX Person VALUES ($"id", $"name", $"age")
        USING USER_DEFINED_HEADER="person_header";
}
```

### DEFINE INPUT_LINE_FILTER

The `DEFINE INPUT_LINE_FILTER` statement defines a named Boolean expression whose value depends on column attributes from a row of input data. When combined with a `USING reject_line_rule` clause in a `LOAD` statement, the filter determines whether an input line is ignored or not.

**Note:** This statement is not supported in a Kafka loading job.

**Syntax:**
```gsql
DEFINE INPUT_LINE_FILTER filter_name = boolean_expression_using_column_variables;
```

**Example:**
```gsql
CREATE LOADING JOB load_data FOR GRAPH MyGraph {
    DEFINE FILENAME f;
    DEFINE INPUT_LINE_FILTER skip_empty = $0 IS EMPTY OR $1 IS EMPTY;
    LOAD f TO VERTEX Person VALUES ($0, $1)
        USING REJECT_LINE_RULE="skip_empty";
}
```

### WHERE Clause in Loading Jobs

The `WHERE` clause is an optional clause in a `LOAD` statement. The `WHERE` clause's condition is a boolean expression. The expression may use column token variables, token functions, and operators.

**Operators in WHERE Clause:**
- Arithmetic: `+`, `-`, `*`, `/`, `^`
- Relational: `<`, `>`, `==`, `!=`, `<=`, `>=`
- Boolean: `AND`, `OR`, `NOT`
- Predicate: `IS NUMERIC`, `IS EMPTY`, `IN`, `BETWEEN ... AND`

**Token Functions in WHERE Clause:**
- `to_int(main_string)`: Converts to integer
- `to_float(main_string)`: Converts to float
- `concat(string1, string2)`: Concatenates strings
- `token_len(main_string)`: Returns string length
- `gsql_is_not_empty_string(main_string)`: Checks if not empty after trimming
- `gsql_token_equal(string1, string2)`: Case-sensitive equality
- `gsql_token_ignore_case_equal(string1, string2)`: Case-insensitive equality
- `gsql_is_true(main_string)`: Checks for "t" or "true"
- `gsql_is_false(main_string)`: Checks for "f" or "false"

**Example:**
```gsql
LOAD f TO VERTEX Person VALUES ($0, $1, $2)
    WHERE to_int($2) >= 18 AND $1 IS NOT EMPTY;
```

### Loading JSON Data

When the USING option `JSON_FILE="true"` is used, the loader loads JSON objects instead of tabular data. Each input line must have exactly one JSON object (JSON lines format).

**JSON Field Access:**
- A JSON field is identified by `$"key"` for top-level keys
- Nested keys use colon-separated path: `$"parent":"child"`
- Example: `{"abc":{"def": "value"}}` is accessed as `$"abc":"def"`

**Example:**
```gsql
CREATE LOADING JOB json_load FOR GRAPH encoding_graph {
  LOAD "encoding.jsonl" TO VERTEX encoding
    VALUES ($"encoding", $"indent":"length") USING JSON_FILE="true";
}
```

### Loading Parquet Data

TigerGraph can load data from Parquet files using JSON loading functionality.

**Requirements:**
1. Specify `"file.reader.type": "parquet"` in the S3 file configuration
2. Specify `JSON_FILE="true"` in the USING clause
3. Refer to JSON keys (≈ Parquet "column names") instead of column numbers
4. Consider adding `USING EOF="true"` to `RUN LOADING JOB` statement

**Example:**
```gsql
CREATE DATA_SOURCE S3 s3ds = "{\"file.reader.settings.fs.s3a.access.key\":\"myaccesskey\",\"file.reader.settings.fs.s3a.secret.key\":\"mysecretkey\"}" FOR GRAPH companyGraph

CREATE LOADING JOB parquet_load FOR GRAPH companyGraph {
    DEFINE FILENAME f = "$s3ds:{\"file.uris\": \"s3://mybucket/mydata.parquet\", \"file.reader.type\": \"parquet\"}";
    LOAD f TO VERTEX members VALUES($"members", $"members") USING JSON_FILE="true";
}
RUN LOADING JOB parquet_load USING EOF="true"
```

**Note:** When loading Parquet data, INT96 data types are not supported.

### Cumulative Loading

Cumulative loading means that a particular data object might be written to (i.e., loaded) multiple times, and the result of the multiple loads may depend on the full sequence of writes.

**Rules:**
- Valid input: Must have correct ID type, correctly typed attribute values, and satisfy WHERE clause
- New data objects: Added to graph store with default values for missing attributes
- Overwriting existing data objects: New attribute values overwrite existing values; missing tokens retain previous values
- Skipping an attribute: Use `_` (underscore) as attribute expression to skip loading that attribute

**Example:**
```gsql
LOAD f TO VERTEX Person VALUES ($0, $1, _, $2)  // Skip third attribute
```

### Loading Complex Attributes

#### Loading LIST or SET

**Method 1: Cumulative loading from multiple rows**
```gsql
CREATE LOADING JOB load_set_list FOR GRAPH Test_Set_List {
  DEFINE FILENAME f;
  LOAD f TO VERTEX Test_Vertex VALUES ($0, $1, $1);
}
```

**Method 2: Using LIST() or SET() function**
```gsql
LOAD f TO VERTEX v_set VALUES ($0, SET($1,$2,$3));
LOAD f TO VERTEX v_list VALUES ($0, LIST($2,$4));
```

**Method 3: Using SPLIT() function**
```gsql
LOAD f TO VERTEX Test_Vertex VALUES ($0, SPLIT($1,"|"), SPLIT($2,"#"));
```

**Note:** The `SPLIT()` function cannot be used for UDT type elements.

#### Loading MAP

**Method 1: Using arrow operator**
```gsql
LOAD f TO VERTEX v_map VALUES ($0, ($1 -> $2));
```

**Method 2: Using MAP() function**
```gsql
LOAD f TO VERTEX V_Map VALUES ($0, MAP(($1 -> $2), ($3 -> $4)));
```

**Method 3: Using SPLIT() function**
```gsql
LOAD f TO VERTEX v_map VALUES ($0, SPLIT($1, ":", ","));
```

**Note:** The `SPLIT()` function cannot be used for UDT type elements.

#### Loading UDT (User-Defined Type)

```gsql
TYPEDEF TUPLE <f1 INT (1), f2 UINT, f3 STRING (10), f4 DOUBLE > My_Tuple
CREATE VERTEX Vertex_UDT (id STRING PRIMARY KEY, att_udt My_Tuple)

CREATE LOADING JOB load_udt FOR GRAPH Test_Graph {
    DEFINE FILENAME f;
    LOAD f TO VERTEX Vertex_UDT VALUES ($0, My_Tuple($1, $2, $3, $4));
}
```

### Loading Composite Keys

Loading a Composite Key for a vertex works no differently than normal loading. Simply load all the attributes as you would for a vertex with a single-attribute primary key.

When loading to an edge where either `TO_VERTEX` or `FROM_VERTEX` contains a composite key, the composite set of attributes must be enclosed in parentheses.

**Example:**
```gsql
CREATE VERTEX Composite_Person (id uint, name string, PRIMARY KEY (name,id))
CREATE VERTEX Composite_Movie (id uint, title string, country string, year uint, primary key (title,year,id))
CREATE DIRECTED EDGE Composite_Roles (from Composite_Person, to Composite_Movie, role string)

CREATE LOADING JOB composite_load FOR GRAPH My_Graph {
  LOAD "$sys.data_root/movies.csv" TO VERTEX Composite_Movie VALUES
       ($"id", $"title", $"country", $"year") USING header="true", separator=",";
  
  LOAD "$sys.data_root/persons.csv" TO VERTEX Composite_Person VALUES
       ($"id", $"name") USING header="true", separator=",";
  
  LOAD "$sys.data_root/compositeroles.csv" TO EDGE Composite_Roles VALUES
       (($"personName", $"personId"), ($"movieTitle", $"movieYear", $"movieId"), $"role")
       USING header="true", separator=",";
}
```

### Loading Wildcard Type Edges

If an edge has been defined using a wildcard vertex type, a vertex type name must be specified, following the vertex id, in a `LOAD` statement for the edge.

**Example:**
```gsql
CREATE VERTEX User (PRIMARY_ID id UINT)
CREATE VERTEX Product (PRIMARY_ID id UINT)
CREATE VERTEX Picture (PRIMARY_ID id UINT)
CREATE UNDIRECTED EDGE Purchase (FROM *, TO *)

CREATE LOADING JOB test_2 FOR GRAPH Test_Graph {
    DEFINE FILENAME f;
    LOAD f
      TO EDGE Purchase VALUES ($0 User, $1 Product),
      TO EDGE Purchase VALUES ($0 User, $2 Picture);
}
```

## GSQL_TEMP_TABLE_AND_FLATTEN_FUNCTIONS

### TEMP_TABLE

The keyword `TEMP_TABLE` triggers the use of a temporary data table which is used to store data generated by one `LOAD` statement, for use by a later `LOAD` statement.

**Syntax:**
```gsql
TO TEMP_TABLE table_name (id_name [, attr_name]*) VALUES (id_expr [, attr_expr]*)
    [WHERE conditions] [OPTION (options)]
```

**Purpose:**
- Store intermediate data from one LOAD statement
- Use in subsequent LOAD statements to create vertices/edges
- Designed to work with `flatten` or `flatten_json_array` functions
- Only one flatten function is allowed in one temp table destination clause

### One-Level Flatten Function

`flatten (column_to_be_split, separator, 1)` is used to parse a one-level group into individual elements.

**Example:**
```gsql
CREATE LOADING JOB load_books_flatten_1 FOR GRAPH Book_Rating {
    DEFINE FILENAME f;
    LOAD f
      TO VERTEX Book VALUES ($0, $1, _),
      TO TEMP_TABLE t1 (bookcode, genre) VALUES ($0, flatten($2, ",", 1)) 
      USING QUOTE="double", SEPARATOR="|";

    LOAD TEMP_TABLE t1
      TO VERTEX Genre VALUES ($"genre", $"genre"),
      TO EDGE Book_Genre VALUES ($"bookcode", $"genre");
}
```

### Two-Level Flatten Function

`flatten (column_to_be_split, group_separator, sub_field_separator, number_of_sub_fields_in_one_group)` is used to parse a two-level group into individual elements.

**Example:**
```gsql
CREATE LOADING JOB load_books_flatten_2 FOR GRAPH Book_Rating {
    DEFINE FILENAME f;
    LOAD f
        TO VERTEX Book VALUES ($0, $1, _),
        TO TEMP_TABLE t2(bookcode, genre_id, genre_name) VALUES ($0, flatten($2, ",", ":", 2))
        USING QUOTE="double", SEPARATOR="|";

    LOAD TEMP_TABLE t2
        TO VERTEX Genre VALUES($"genre_id", $"genre_name"),
        TO EDGE Book_Genre VALUES($"bookcode", $"genre_id");
}
```

### Flatten JSON Array of Primitive Values

`flatten_json_array($"array_name")` splits an array of primitive values.

**Example:**
```gsql
// JSON: {"plug-ins": ["C", "c++"], "encoding": "UTF-6"}
LOAD f TO TEMP_TABLE t1 (encoding, plugin) VALUES ($"encoding", flatten_json_array($"plug-ins"))
```

### Flatten JSON Array of JSON Objects

`flatten_json_array($"array_name", $"sub_obj_1", $"sub_obj_2", ..., $"sub_obj_n")` splits an array of JSON objects.

**Example:**
```gsql
// JSON: {"plug-ins": [{"lang": "java", "score": 2.22}, {"lang": "python", "score": 3.0}]}
LOAD f TO TEMP_TABLE t1 (lang, score) VALUES (
    flatten_json_array($"plug-ins", $"lang", $"score")
)
```

### Flatten JSON Object in CSV File

The function can also be used to flatten a JSON object in a CSV file.

**Example:**
```gsql
// CSV: golang|{"prop":{"age":"noidea"}}
LOAD f TO TEMP_TABLE t1 (lang, age) VALUES (
    $0,
    flatten_json_array($"prop", $"age")
) USING SEPARATOR="|", JSON_FILE="false"
```

## GSQL_DELETE_STATEMENT_IN_LOADING_JOBS

In addition to loading data, a loading job can be used to perform the opposite operation: deleting vertices and edges, using the `DELETE` statement.

**Syntax:**
```gsql
CREATE LOADING JOB abc FOR GRAPH Graph_Name {
  DEFINE FILENAME f;
  
  // Delete each vertex which has the given vertex type and primary id
  DELETE VERTEX vertex_type_name (PRIMARY_ID id_expr) FROM f [WHERE condition];
  
  // Delete each edge which has the given edge type, source vertex id, target vertex id, and discriminator value if provided
  DELETE EDGE edge_type_name (FROM id_expr, TO id_expr[, DISCRIMINATOR (id_expr)]) FROM f [WHERE condition];
  
  // Delete all edges which have the given edge type and source vertex id
  DELETE EDGE edge_type_name (FROM id_expr) FROM f [WHERE condition];
  
  // Delete all edges which have the given source vertex id
  DELETE EDGE * (FROM id_expr vertex_type_name) FROM f [WHERE condition];
}
```

**Example:**
```gsql
CREATE LOADING JOB clean_user_occupation FOR GRAPH Book_Rating {
  DEFINE FILENAME f;
  DELETE EDGE User_Occupation (FROM $0) FROM f;
}

CREATE LOADING JOB load_user_occupation FOR GRAPH Book_Rating {
  DEFINE FILENAME f;
  LOAD f TO EDGE User_Occupation VALUES ($0, $1);
}

RUN LOADING JOB clean_user_occupation USING f="./data/User_Occupation_update.dat"
RUN LOADING JOB load_user_occupation USING f="./data/User_Occupation_update.dat"
```

**Delete with Discriminator:**
```gsql
DELETE EDGE Study_At (from $"person_id", to $"university_id",
    DISCRIMINATOR($"class_year", $"class_month")) from f;
```

**Note:** There is a separate DELETE statement in the GSQL Query Language. The query delete statement can leverage the query language's ability to explore the graph and use complex conditions. In contrast, the loading job delete statement requires that the id values of the items to be deleted must be specified in advance in an input file.

## GSQL_SUBQUERIES

A query defined with a `RETURNS` header following its `CREATE` statement is called a subquery. Subqueries act as callable functions in GSQL: they take parameters, perform a set of actions and return a value.

**Main Components:**
```gsql
CREATE QUERY <query_name>() FOR GRAPH <Graph_Name> 
RETURNS (INT) 
{
    // Query body goes here
    RETURN <return_value> 
}
```

**Subquery Limitations:**
- Interpreted mode is not supported
- A distributed query cannot call another distributed query
- A non-distributed query cannot call a distributed query in an `ACCUM` or `POST-ACCUM` clause
- A subquery must be created before the query that calls the subquery
- A subquery must be installed either before or in the same `INSTALL QUERY` command with the query that calls the subquery

**Parameter Types:**
A subquery parameter can only be one of the following types:
- Primitives: `INT`, `UINT`, `FLOAT`, `DOUBLE`, `STRING`, `BOOL`
- `VERTEX`
- A set or bag of primitive or `VERTEX` elements

**Return Types:**
A subquery's return value can be any base type variable or accumulator with the following exceptions:
- If the return type is a `HeapAccum` or `GroupByAccum` that has a user-defined tuple as an element, the user-defined tuple must be defined at the catalog level
- If the return type is a `BagAccum`, `SetAccum`, or `ListAccum` with a tuple as its element, the tuple does not need to be defined at the catalog level and can be anonymous

**Example:**
```gsql
CREATE QUERY sub_query(VERTEX x)
RETURNS (ListAccum<TUPLE<INT, STRING, DOUBLE>>)
{
    TYPEDEF tuple<INT a, STRING b, DOUBLE c> My_Tuple;
    ListAccum<My_Tuple> @@res;
    RETURN @@res;
}
```

**Recursive Subqueries:**
Recursion is supported for subqueries and a subquery can call itself.

**Example:**
```gsql
CREATE QUERY sub_find_friends_in_distance(SET<VERTEX> seeds, INT distance)
FOR GRAPH Friend_Net RETURNS (SET<VERTEX>)
{
    IF distance <= 0 THEN
        RETURN seeds;
    ELSE
        seed_vs = seeds;
        next_vs = SELECT v FROM seed_vs -(Friend:e)- :v;
        RETURN seeds UNION sub_find_friends_in_distance(next_vs, distance - 1);
    END;
}
```

## GSQL_SAMPLE_CLAUSE

The `SAMPLE` clause is an optional clause that selects a uniform random sample from the population of edges or target vertices specified in the `FROM` argument.

**Note:** The `SAMPLE` clause is not supported in syntax V2 in 4.2. To use `SAMPLE` clauses, write your query in syntax V1.

**Syntax:**
```gsql
SAMPLE (expr | expr "%") EDGE WHEN condition 
SAMPLE expr TARGET WHEN condition              
SAMPLE expr "%" TARGET PINNED WHEN condition
```

**Sampling Methods:**
- Sampling based on edge ID
- Sampling based on target vertex ID: if a target vertex ID is sampled, all edges from this source vertex to the sampled target vertex are sampled

**Example:**
```gsql
CREATE QUERY sample_ex_3() FOR GRAPH Computer_Net {
    MapAccum<STRING,ListAccum<STRING>> @@abs_edges;
    SumAccum<INT> @@total_abs;
    
    start = {Computer.*};
    
    // Sample one outgoing edge per source vertex = Random Walk
    abs_sample = SELECT v FROM (s:start) -[e]- (v)
        SAMPLE 1 EDGE WHEN s.outdegree() >= 1
        ACCUM
            @@abs_edges += (s.id -> v.id),
            @@total_abs += 1;
    
    // Sample 33% of edges when outdegree >= 3
    pct_sample = SELECT v FROM start:s -(:e)- :v
        SAMPLE 33% EDGE WHEN s.outdegree() >= 3
        ACCUM
            @@pct_edges += (s.id -> v.id),
            @@total_pct += 1;
}
```

**Note:** Currently, the `WHEN` condition that can be used with a `SAMPLE` clause is limited strictly to checking if the result of a function call on a vertex is greater than or greater than/equal to some number.

## GSQL_PER_CLAUSE

The `PER` clause is an optional prefix to an `ACCUM` clause, affecting only that clause.

**Purpose:**
- The `FROM` clause of a `SELECT` statement produces a match table
- The `PER` clause allows the user to specify that they wish to aggregate the match table, so that there is one row per alias

**Example:**
```gsql
SELECT t FROM (s:start) -[e]- (t)
    PER (s)
    ACCUM s.@count += 1
```

This ensures that the ACCUM clause executes once per distinct source vertex `s`, rather than once per edge match.

## GSQL_COMPLETE_TOKEN_FUNCTIONS_REFERENCE

### Token Functions for Attribute Expressions

| Function | Output type | Description |
| :---- | :---- | :---- |
| `gsql_reverse(in_string)` | string | Returns a string with the characters in the reverse order |
| `gsql_concat(string1, string2, ..., stringN)` | string | Returns concatenation of all input strings |
| `gsql_uuid_v4()` | string | Returns a version-4 UUID |
| `gsql_split_by_space(in_string)` | string | Replaces each space with ASCII 30 (decimal) |
| `gsql_substring(str, beginIndex [, length])` | string | Returns substring beginning at beginIndex |
| `gsql_find(str, substr)` | int | Returns start index of substring, -1 if not found |
| `gsql_length(str)` | int | Returns the length of the string |
| `gsql_replace(str, oldToken, newToken [, max])` | string | Replaces all matchings of oldToken with newToken |
| `gsql_regex_replace(str, regex, replaceSubstr)` | string | Replaces substrings matching regex |
| `gsql_regex_match(str, regex)` | bool | Returns true if string matches regex |
| `gsql_to_bool(in_string)` | bool | Returns true if in_string is "t" or "true" (case-insensitive) |
| `gsql_to_uint(in_string)` | uint | Converts string to unsigned integer |
| `gsql_to_int(in_string)` | int | Converts string to integer |
| `gsql_ts_to_epoch_seconds(timestamp)` | uint | Converts timestamp to Unix epoch seconds |
| `gsql_current_datetime()` | datetime | Returns time when loading initiates |
| `gsql_current_time_epoch()` | uint | Returns current time in Unix epoch seconds |
| `flatten(column, group_separator, 1)` | | See TEMP_TABLE section |
| `flatten(column, group_separator, sub_field_separator, num_fields)` | | See TEMP_TABLE section |
| `flatten_json_array($"array_name")` | | See TEMP_TABLE section |
| `flatten_json_array($"array_name", $"sub_obj_1", ...)` | | See TEMP_TABLE section |
| `split(column, element_separator)` | | Splits into LIST or SET |
| `split(column, key_value_separator, element_separator)` | | Splits into MAP |
| `gsql_upper(in_string)` | string | Returns uppercase string |
| `gsql_lower(in_string)` | string | Returns lowercase string |
| `gsql_trim(in_string)` | string | Trims whitespace from beginning and end |
| `gsql_ltrim(in_string)` | string | Trims whitespace from left |
| `gsql_rtrim(in_string)` | string | Trims whitespace from right |
| `gsql_year(timestamp)` | int | Returns 4-digit year from timestamp |
| `gsql_month(timestamp)` | int | Returns month (1-12) from timestamp |
| `gsql_day(timestamp)` | int | Returns day (1-31) from timestamp |
| `gsql_year_epoch(epoch)` | int | Returns 4-digit year from Unix epoch |
| `gsql_month_epoch(epoch)` | int | Returns month (1-12) from Unix epoch |
| `gsql_day_epoch(epoch)` | int | Returns day (1-31) from Unix epoch |

**Timestamp Input Format:**
- `"%Y-%m-%d %H:%M:%S"` (e.g., 2011-02-03 01:02:03)
- `"%Y/%m/%d %H:%M:%S"` (e.g., 2011/02/03 01:02:03)
- `"%Y-%m-%dT%H:%M:%S.000z"` (e.g., 2011-02-03T01:02:03.123z)
- Text after the dot `.` is ignored

### Reducer Functions

Reducer functions aggregate multiple values of a non-ID attribute into one attribute value.

**Syntax:**
```gsql
REDUCE(reducer_function (input_expr))
```

**Reducer Functions:**
- `max(arg)`: Maximum of all values (INT, UINT, FLOAT, DOUBLE)
- `min(arg)`: Minimum of all values (INT, UINT, FLOAT, DOUBLE)
- `add(arg)`: Sum for numeric types, concatenation for STRING, accumulation for collections
- `and(arg)`: AND for BOOL, bitwise AND for INT/UINT
- `or(arg)`: OR for BOOL, bitwise OR for INT/UINT
- `overwrite(arg)`: Overwrites with new value
- `ignore_if_exists(arg)`: Retains existing value if exists, otherwise loads arg

**Example:**
```gsql
LOAD f TO VERTEX Person VALUES ($0, REDUCE(add($1)));
```

## GSQL_FILE_OBJECT

A `FILE` object is a sequential data storage object, associated with a text file on the local machine or with an S3 bucket.

**Note:** When referring to a `FILE` object, we always capitalize the word `FILE` to distinguish it from ordinary files.

### Local Disk File

When a `FILE` object is declared, associated with a particular text file, any existing content in the text file will be erased. During the execution of the query, content written to the `FILE` will be appended to the `FILE`. When the query where the `FILE` was declared finishes running, the `FILE` contents are saved to the text file.

**Declaration Syntax:**
```gsql
FILE fileVar ("path/to/file");
FILE fileVar ("path/to/file", "permissions");  // With octal-encoded permissions (e.g., "764")
```

**Example:**
```gsql
CREATE QUERY write_to_file(STRING file_location) FOR GRAPH MyGraph {
    FILE f1 (file_location);
    FILE f2 (file_location, "764");  // With file permissions
    
    // Write to file
    PRINT "header" TO_CSV f1;
    f1.println("data", "line");
    PRINT "footer" TO_CSV f1;
}
```

### S3 Object

#### Define S3 File Object

The path should start with `s3://`, followed by the bucket name and the S3 path, e.g., `s3://bucket-name/queryoutput/output.csv`. During the execution of the query, content will be uploaded to the S3 bucket.

**Important:** The S3 object cannot be modified or appended. If an S3 object with the same path already exists, it will be overwritten.

**Declaration Syntax:**
```gsql
FILE fileVar ("s3://bucket-name/path/to/file");
```

**Example:**
```gsql
CREATE QUERY write_to_s3() FOR GRAPH MyGraph {
    FILE s3_file ("s3://my-bucket/query-output/output.csv");
    
    PRINT @@results TO_CSV s3_file;
}
```

#### Set S3 Connection Credentials

The S3 credentials can be set as GSQL session parameters, so they persist for a user for a full session.

```gsql
set s3_aws_access_key_id = <AWS_KEY_ID>;
set s3_aws_secret_access_key = <AWS_ACCESS_KEY>;
```

These session parameters should be set within the GSQL Editor to enable read/write access to the specified S3 bucket for query results. Replace `<AWS_KEY_ID>` and `<AWS_ACCESS_KEY>` with your actual AWS credentials.

#### S3 Output Naming

Since S3 is a shared storage system, multiple nodes in a cluster can upload to the same S3 bucket. To handle potential conflicts and ensure unique output files, the S3 path can include a suffix based on the instance name, such as `_GPE_{PartitionId}_{ReplicaId}`. For distributed queries, additional suffixes will be used to differentiate between the manager and worker roles on the same GPE. Specifically, suffixes like `_coordinator` and `_worker` will be added, where `_coordinator` refers to the worker manager and `_worker` refers to the worker node.

#### Error Handling

For S3 bucket connection errors, refer to error code `GSQL-5301`.

### File Permissions

As of 4.2.1, users can declare a FILE object with a Linux octal-encoded file permission code to specify file permissions.

**Syntax:**
```gsql
FILE fileVar (file_path, "permissions");
```

**Example:**
```gsql
FILE f1 ("/home/tigergraph/output.txt", "764");
```

### Passing FILE Object as Parameter

A `FILE` object can be passed as a parameter to another query. When a query receives a `FILE` object as a parameter:
- For a file on the local machine: It can append data to that `FILE`, as can every other query which receives this FILE object as a parameter.
- For an S3 bucket `FILE` object: It cannot be appended to. When you write to an S3 path, any existing object will be overwritten.

**Example:**
```gsql
CREATE QUERY file_param_sub(FILE f, STRING label, INT num) FOR GRAPH Social_Net {
    f.println(label, "header");
    FOREACH i IN RANGE [1,2] DO
        f.println(label, num+i);
    END;
    f.println(label, "footer");
}

CREATE QUERY file_param_main(STRING main_label) FOR GRAPH Social_Net {
    FILE f ("/home/tigergraph/file_param.txt");
    f.println(main_label, "header");
    FOREACH i IN RANGE [1,2] DO
        f.println(main_label, i);
        file_param_sub(f, "sub", 10*i);
    END;
    f.println(main_label, "footer");
}
```

## GSQL_PRINT_STATEMENT_DETAILS

The `PRINT` statement specifies output data. Each execution of a `PRINT` statement adds a JSON object to the results array which will be part of the query output. A `PRINT` statement can appear wherever query-body statements are permitted.

**Note:** A `PRINT` statement does not trigger immediate output. The full set of data from all PRINT statements is delivered at one time, when the query concludes. If the query response is large, it is recommended to use `PRINT … TO_CSV`.

### PRINT Statement Syntax

```gsql
PRINT printExpr ("," printExpr)* [WHERE condition] [TO_CSV (filePath | fileVar)]
```

**EBNF:**
```
printStmt := PRINT printExpr ("," printExpr)* [WHERE condition] [TO_CSV (filePath | fileVar)]
printExpr := (expr | vExprSet) [ AS jsonKey]
           | tableName
vExprSet  := expr "[" vSetProj ("," vSetProj)* "]"
vSetProj  := expr [ AS jsonKey]
jsonKey := name
```

### PRINT Expressions

Each `printExpr` may be one of the following:
- A literal value
- A global or local variable (including `VERTEX` and `EDGE` variables)
- An attribute of a vertex variable, e.g., `Person.name`
- A global accumulator
- An expression whose terms are among the types above
- A vertex set variable
- A vertex expression set `vExprSet` (only available if the output API is set to `"v2"`)

**Operators in PRINT Expressions:**

| Data type | Operators |
| :---- | :---- |
| String | concatenation: `+` |
| Set | `UNION INTERSECT MINUS` |
| Numeric | Arithmetic: `+ - * / %` Bit: `<< >> & \|` |

Parentheses can be used for controlling order of precedence.

**Example:**
```gsql
STRING str = "first statement";
INT number = 5;
PRINT str, number;

str = "second statement";
number = number + 1;
PRINT str, number;
```

### JSON Format: Keys

If a `printExpr` includes the optional `AS name` clause, then the name sets the key for that expression in the JSON output. Otherwise, the following rules determine the key:
- If the expression is simply a single variable (local variable, global variable, global accumulator, or vertex set variable), then the key is the variable name.
- The key for a vertex expression set is the vertex set variable name.
- Otherwise, the key is the entire expression, represented as a string.

**Example:**
```gsql
PRINT paper_height*paper_width AS paper_size, Alpha+"XYZ" AS Letters;
PRINT A.size() > 10;  // Key will be "A.size()>10"
```

### JSON Format: Values

Each data type has a distinct output format:
- Simple numeric, string, and boolean data types follow JSON standards.
- Lists, sets, bags, and arrays are printed as JSON arrays (i.e., a list enclosed in square brackets).
- Maps and tuples are printed as JSON objects (i.e., a list of key:value pairs enclosed in curly braces).
- Vertices and edges have a custom JSON object format.
- A vertex set variable is treated as a list of vertices.
- Accumulator output format is determined by the accumulator's return type.

**Accumulator Output Formats:**
- `ListAccum`, `SetAccum`, `BagAccum`, `ArrayAccum`: list
- `MapAccum`: map
- `HeapAccum`, `GroupByAccum`: list of tuples

**Note:** Full details of vertices are printed only when part of a vertex set variable or vertex expression set. When a single vertex is printed (from a variable or accumulator whose data type happens to be `VERTEX`), only the vertex id is printed.

### Vertex Output Formats

**Vertex (when not part of a vertex set variable):**
```json
"<vertex_id>"
```

**Vertex (as part of a vertex set variable):**
```json
{
  "v_id": "<vertex_id>",
  "v_type": "<vertex_type>",
  "attributes": {
    "<attr_name>": "<attr_value>",
    ...
  }
}
```

**Edge:**
```json
{
  "e_type": "<edge_type>",
  "directed": <boolean_value>,
  "from_id": "<source_vertex_id>",
  "from_type": "<source_vertex_type>",
  "to_id": "<target_vertex_id>",
  "to_type": "<target_vertex_type>",
  "attributes": {
    "<attr_name>": "<attr_value>",
    ...
  }
}
```

**List, Set or Bag:**
```json
[<value1>, <value2>, ..., <valueN>]
```

**Map:**
```json
{
  <key1>: <value1>,
  <key2>: <value2>,
  ...,
  <keyN>: <valueN>
}
```

**Tuple:**
```json
{
  <fieldName1>: <value1>,
  <fieldName2>: <value2>,
  ...,
  <fieldNameN>: <valueN>
}
```

**Vertex Set Variable:**
```json
[<vertex1>, <vertex2>, ..., <vertexN>]
```

### PRINT WHERE Clause

The optional `WHERE` clause filters the output to exclude any items for which the condition is false.

**Example:**
```gsql
INT x = 3;
PRINT x WHERE x < 0;   // Skipped because condition is false
PRINT x WHERE x > 0;   // Printed: 3
```

### PRINT TO_CSV

Instead of printing output in JSON format, output can be written to a `FILE` object in comma-separated values (CSV) format by appending the keyword `TO_CSV` followed by the `FILE` object name to the `PRINT` statement.

**Syntax:**
```gsql
PRINT printExpr ("," printExpr)* TO_CSV fileVar;
PRINT printExpr ("," printExpr)* TO_CSV "file_path";
```

**Behavior:**
- Each execution of the `PRINT` statement appends one line to the `FILE`.
- If the `PRINT` statement includes multiple expressions, then each printed value is separated from its neighbor by a comma.
- If an expression evaluates to a set or list, then the collection's values are delimited by single spaces.
- Due to the simpler format of CSV vs. JSON, the `TO_CSV` feature only supports data with a simple one- or two-dimension structure.

**Limitations:**
- In 4.2.1, printing a full vertex set is supported with `PRINT vt` and `PRINT vt TO_CSV f`. Only vertex IDs are printed.
- If printing a vertex set's vertex-attached accumulator or a vertex set's variable, the result is a list of values, one for each vertex, separated by newlines.
- The syntax for printing a vertex set expression is different when printing to a file than when printing to standard output:
  - `PRINT A[A.gender];` (with brackets for standard output)
  - `PRINT A.gender TO_CSV file1;` (without brackets for CSV)

**Order Guarantees:**
Writing to `FILE` objects is optimized for parallel processing. Consequently, the order in which data is written to the `FILE` is not guaranteed. Therefore, it is strongly recommended that the user design their queries such that one of these conditions is satisfied:
- The query prints only one set of data, and the order of the set is not important.
- Each line of data to print to a file includes a label which can be used to identify the data.

**Example:**
```gsql
CREATE QUERY print_example_file() FOR GRAPH Social_Net {
    SetAccum<VERTEX> @@test_set, @@test_set2;
    ListAccum<STRING> @@str_list;
    INT x = 3;
    FILE file1 ("/home/tigergraph/print_example_file.txt");
    FILE s3_object ("s3://bucket-name/path/print_example_file.txt");

    Seed = Person.*;
    A = SELECT s FROM Seed:s
        WHERE s.gender == "Female"
        ACCUM @@test_set += s, @@str_list += s.gender;
    A = SELECT s FROM Seed:s
        WHERE s.gender == "Male"
        ACCUM @@test_set2 += s;

    PRINT @@test_set, @@test_set2 TO_CSV file1;
    PRINT x WHERE x < 0 TO_CSV file1;   // Skipped
    PRINT x WHERE x > 0 TO_CSV file1;   // Printed: 3
    PRINT @@str_list TO_CSV file1;
    PRINT A.gender TO_CSV file1;
    
    PRINT @@test_set, @@test_set2 TO_CSV s3_object;
}
```

### Vertex Expression Sets

A vertex expression set is a list of expressions applied to each vertex in a vertex set variable. The expression list is used to compute an alternative set of values to display in the "attributes" field of each vertex.

**Syntax:**
```gsql
vExprSet := expr "[" vSetProj {, vSetProj} "]"
vSetProj := expr [ AS name]
```

**Examples:**
```gsql
CREATE QUERY v_expr_set() FOR GRAPH Work_Net {
    SumAccum<INT> @count;
    C = {Company.*};

    // Print only country attribute
    PRINT C[C.country];
    
    // Print only @count accumulator
    PRINT C[C.@count];
    
    // Print @count with alias
    PRINT C[C.@count AS company_count];
    
    // Print multiple attributes
    PRINT C[C.id, C.@count];
    
    // Print with computed expressions
    PRINT C[C.id+"_ex", C.@count+1];
}
```

**Comprehensive Example:**
```gsql
CREATE QUERY print_example_v2(VERTEX<Person> v) FOR GRAPH Social_Net {
    SetAccum<VERTEX> @@set_of_vertices;
    SetAccum<EDGE> @posted_set;
    MapAccum<VERTEX,ListAccum<VERTEX>> @@test_map;
    FLOAT paper_width = 8.5;
    INT paper_height = 11;
    STRING Alpha = "ABC";

    Seed = Person.*;
    A = SELECT s FROM Seed:s
        WHERE s.gender == "Female"
        ACCUM @@set_of_vertices += s;

    B = SELECT t FROM Seed:s - (Posted>:e) - Post:t
        ACCUM s.@posted_set += e,
            @@test_map += (s -> t);

    // Numeric, String, and Boolean expressions, with renamed keys
    PRINT paper_height*paper_width AS paper_size, Alpha+"XYZ" AS Letters,
          A.size() > 10 AS a_size_more_than_10;
    
    // Expression without AS clause
    PRINT A.size() > 10;
    
    // Vertex variables (only IDs printed)
    PRINT v, @@set_of_vertices;
    
    // Map
    PRINT @@test_map;
    
    // Vertex Set Variable (full details)
    PRINT A AS v_set_var_women;
    
    // Vertex Set Expression (customized attributes)
    PRINT A[A.gender, A.@posted_set.size()] AS v_set_expr;
}
```

## GSQL_FILE_PRINTLN_STATEMENT

The `FILE println` statement writes data to a `FILE` object. Unlike the `PRINT` statement, which is a query-body level statement, the `FILE println` statement can be either a query-body level statement or a DML-sub-statement.

**Syntax:**
```gsql
fileVar.println(expr ("," expr)*)
```

**Behavior:**
- `println` is a method of a FILE object variable.
- Each time `println` is called, it adds one new line of values to the `FILE` object, and then to the corresponding file.
- If the `println` statement has a list of expressions to print, it will produce a comma-separated list of values.
- If an expression refers to a list or set, then the output will be a list of values separated by spaces.

**Limitations:**
- The `println` function can print any expression that can be printed by a `PRINT` statement with the exception of vertex set variables.
- Vertex expression sets are also not applicable to the `println` function.

**Order Guarantees:**
- The data from query-body level `FILE` print statements (either `TO_CSV` or `println`) will appear in their original order.
- However, due to the parallel processing of statements in an `ACCUM` block, the order in which `println` statements at the DML-sub-statement level are processed cannot be guaranteed.

**Example:**
```gsql
CREATE QUERY file_ex(STRING file_location) FOR GRAPH Work_Net {
    // Declare FILE object f1 with an octal-encoded file permission "764"
    FILE f1 (file_location, "764");
    
    // Initialize a seed set of all person vertices
    P = {Person.*};
    
    PRINT "header" TO_CSV f1;
    
    // Select workers located in the US and print their interests
    USWorkers = SELECT v FROM P:v
        WHERE v.location_id == "us"
        ACCUM f1.println(v.id, v.interest_list);
    
    PRINT "footer" TO_CSV f1;
}
```

**File Output:**
```
header
person7,art sport
person10,football sport
person4,football
person9,financial teaching
person1,management financial
footer
```

**Note:** Within the `ACCUM` clause itself, the order of the `println` statements is not guaranteed.

## GSQL_JSONOBJECT_AND_JSONARRAY_TYPES

### JSONOBJECT

A `JSONOBJECT` instance's external representation (as input and output) is a string, starting and ending with curly braces (`{}`) which enclose an unordered list of key-value pairs. `JSONOBJECT` is immutable. No operator is allowed to alter its value.

**Key Characteristics:**
- Immutable type
- External representation as string with curly braces
- No literal syntax in GSQL
- Cannot be used as query parameter
- Cannot be altered after creation

**Creating JSONOBJECT:**

There is no `JSONOBJECT` literal in the GSQL query language. Therefore, to assign value to a `JSONOBJECT` base type variable in GSQL, you need to use the `parse_json_object()` function to convert a string representation of a JSON object to a `JSONOBJECT` value.

**Syntax:**
```gsql
JSONOBJECT var_name = parse_json_object(json_string);
```

**Example:**
```gsql
CREATE QUERY json_example() FOR GRAPH MyGraph {
    JSONOBJECT han = parse_json_object("{\"f_name\": \"Han\", \"l_name\": \"Solo\"}");
    PRINT han;
}
```

### JSONARRAY

A `JSONARRAY` is represented as a string, starting and ending with square brackets (`[]`) which enclose an ordered list of values. `JSONARRAY` is immutable. No operator is allowed to alter its value.

**Key Characteristics:**
- Immutable type
- External representation as string with square brackets
- No literal syntax in GSQL
- Cannot be used as query parameter
- Cannot be altered after creation

**Creating JSONARRAY:**

There is no `JSONARRAY` literal in the GSQL query language. Therefore, to assign value to a `JSONARRAY` base type variable in GSQL, you need to use the `parse_json_array()` function to convert a string representation of a JSON array to a `JSONARRAY` value.

**Syntax:**
```gsql
JSONARRAY var_name = parse_json_array(json_array_string);
```

**Example:**
```gsql
CREATE QUERY json_array_example() FOR GRAPH MyGraph {
    JSONARRAY fruits = parse_json_array("[\"apple\", \"banana\", \"citrus\"]");
    PRINT fruits;
}
```

**Use Cases:**
- JSON data handling in queries
- Parsing JSON strings from external sources
- Working with JSON data structures
- Converting JSON strings to typed variables for processing

**Limitations:**
- Cannot be used as query parameters
- Cannot be modified after creation (immutable)
- Must use parse functions to create instances

## GSQL_QUERY_PARAMETER_TYPES

A query can have one or more input parameters having any of the following types:

**Supported Parameter Types:**
- Base types (except `EDGE`, `JSONARRAY`, or `JSONOBJECT`)
- `FILE` object
- A `SET` or `BAG` of base type elements (except `EDGE`, `JSONARRAY`, or `JSONOBJECT`)
- As of 4.2, `LIST` and `MAP` of base type elements are also supported. The key and value of a `MAP` may be primitiveType (numerical, string, or Boolean).

**Parameter Conversion:**
Within the query, `SET`, `BAG`, `LIST`, and `MAP` parameters are converted to accumulators:
- `SET` → `SetAccum`
- `BAG` → `BagAccum`
- `LIST` → `ListAccum`
- `MAP` → `MapAccum`

**Parameter Immutability:**
A query parameter is immutable. It cannot be assigned a new value within the query. The `FILE` object is a special case. It is passed by reference, meaning that the receiving query gets a link to the original `FILE` object. The receiving query can write to the `FILE` object.

**EBNF Syntax:**
```
parameterType := INT
               | UINT
               | FLOAT
               | DOUBLE
               | STRING
               | BOOL
               | VERTEX ["<" vertexType ">"]
               | DATETIME
               | [ SET | BAG | LIST ] "<" baseType ">"
               | MAP "<" primitiveType "," primitiveType ">"
               | FILE
```

**Examples:**
```gsql
// Base types
CREATE QUERY example1(STRING name, INT age, BOOL active) FOR GRAPH MyGraph {
    PRINT name, age, active;
}

// Collections
CREATE QUERY example2(BAG<INT> ids, SET<VERTEX<Person>> friends) FOR GRAPH MyGraph {
    PRINT ids, friends;
}

// FILE object
CREATE QUERY example3(FILE f1, STRING label) FOR GRAPH MyGraph {
    f1.println(label, "data");
}

// Mixed parameters
CREATE QUERY example4(STRING name, BAG<INT> ids, SET<VERTEX<Person>> friends, FILE f1) FOR GRAPH MyGraph {
    PRINT name;
    f1.println("IDs:", ids);
}
```

**Running Queries with Parameters:**

**GSQL CLI:**
```gsql
RUN QUERY example1("John", 30, true);
RUN QUERY example4("Alice", (1,2,3), (person1, person2), "/path/to/file");
```

**REST API:**
```json
{
  "name": "John",
  "age": 30,
  "active": true
}
```

This comprehensive knowledge base covers all major aspects of GSQL including syntax, patterns, accumulators, control flow, functions, schema changes, advanced loading features, subqueries, sampling, FILE objects, PRINT statements, JSON types, query parameters, and best practices. It is optimized for RAG retrieval and AI code generation.
