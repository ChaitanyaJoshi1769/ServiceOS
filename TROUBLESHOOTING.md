# ServiceOS Troubleshooting Guide

Common issues and solutions for ServiceOS.

## Workflow Issues

### Workflow Hangs or Never Completes

**Symptoms:**
- Execution status stays "running"
- No error messages
- Steps not progressing

**Solutions:**
1. Check step timeout configuration
   ```json
   {
     "id": "step1",
     "timeout": 300000  // 5 minutes
   }
   ```

2. Verify external service availability
   ```bash
   # Check API endpoint health
   curl -f https://external-api.com/health
   
   # Check database connectivity
   psql -h localhost -U postgres -d serviceos -c "SELECT 1"
   ```

3. Monitor step execution logs
   ```bash
   kubectl logs -l workflow=execution-id --tail=100
   ```

4. Cancel stuck execution
   ```bash
   curl -X POST http://api.serviceos.com/executions/{executionId}/cancel
   ```

### Workflow Fails with Timeout

**Symptoms:**
- Execution fails after timeout period
- Step status shows "timeout"

**Solutions:**
1. Increase step timeout
   ```json
   {
     "id": "step1",
     "timeout": 600000  // Increase to 10 minutes
   }
   ```

2. Optimize step performance
   - Cache external API calls
   - Use parallel execution for independent steps
   - Reduce data payload size

3. Check resource constraints
   ```bash
   # Check CPU and memory usage
   kubectl top pods -l app=serviceos
   
   # Check database connection pool
   SELECT count(*) FROM pg_stat_activity;
   ```

### Step Execution Fails

**Symptoms:**
- Step status shows "failed"
- Error message in execution output

**Solutions:**
1. Check error details
   ```bash
   curl http://api.serviceos.com/executions/{executionId}
   ```

2. Review step input validation
   ```json
   {
     "id": "step1",
     "input": {
       "required_field": "$.expectedPath"  // Ensure path exists
     }
   }
   ```

3. Add error handling
   ```json
   {
     "id": "step1",
     "type": "action",
     "action": "risky_action",
     "onError": "error_recovery_step",
     "retry": {
       "maxAttempts": 3,
       "delayMs": 1000
     }
   }
   ```

4. Check external service dependencies
   ```bash
   # Test service connectivity
   telnet api.example.com 443
   
   # Verify credentials
   echo $API_KEY | wc -c  # Should be > 10 characters
   ```

## Agent Issues

### Agent Task Fails or Returns Incorrect Results

**Symptoms:**
- Agent execution fails
- Results are inaccurate or unexpected

**Solutions:**
1. Review system prompt
   ```typescript
   const agent = new Agent({
     systemPrompt: 'Clear, specific instructions for the task'
   });
   ```

2. Provide better context
   ```typescript
   const result = await agent.execute({
     task: 'Specific task description',
     context: {
       domain: 'insurance',
       documentType: 'policy'
     }
   });
   ```

3. Adjust model and parameters
   ```typescript
   const agent = new Agent({
     model: 'claude-3-opus',  // Use more capable model
     maxTokens: 8192,         // Increase context window
     temperature: 0.7         // Adjust for consistency
   });
   ```

4. Test with simple tasks first
   - Verify agent can handle basic requests
   - Gradually increase complexity
   - Add test cases for edge cases

### Agent Takes Too Long or Runs Out of Tokens

**Symptoms:**
- Agent execution is slow
- Token limit exceeded error

**Solutions:**
1. Simplify task prompts
   - Remove unnecessary details
   - Use structured input format
   - Provide pre-processed data

2. Use smaller model for simple tasks
   ```typescript
   const simpleAgent = new Agent({
     model: 'claude-3-haiku',  // Faster, cheaper
     maxTokens: 2048
   });
   ```

3. Implement caching
   ```typescript
   const cachedResults = new Map();
   
   if (cachedResults.has(taskKey)) {
     return cachedResults.get(taskKey);
   }
   ```

4. Use tools to offload complex logic
   ```typescript
   toolRegistry.register({
     name: 'calculate',
     execute: async (params) => {
       // Complex logic handled by tool
       return result;
     }
   });
   ```

## Approval Issues

### Approval Requests Expire Unexpectedly

**Symptoms:**
- Approval status changes to "expired"
- Users don't see notification

**Solutions:**
1. Increase timeout duration
   ```bash
   curl -X POST /approvals \
     -d '{
       "dueDate": "2024-05-30T23:59:59Z"  // Extended date
     }'
   ```

2. Implement approval reminder
   ```typescript
   setInterval(async () => {
     const approval = await approvalEngine.getStatus(approvalId);
     if (approval.hoursRemaining < 24) {
       await notifier.sendReminder(approval.assignees);
     }
   }, 60 * 60 * 1000);  // Check hourly
   ```

3. Configure escalation
   ```json
   {
     "id": "approval",
     "type": "approval",
     "escalation": {
       "afterHours": 24,
       "escalateTo": "manager@company.com"
     }
   }
   ```

### Approval Notifications Not Received

**Symptoms:**
- Assignees don't receive approval requests
- Approval stays pending indefinitely

**Solutions:**
1. Verify notification configuration
   ```bash
   # Check email service
   curl -X POST /notifications/test \
     -d '{"channel": "email", "recipient": "test@example.com"}'
   
   # Check SMTP settings
   echo "Test" | mail -s "Test" test@example.com
   ```

2. Check notification logs
   ```bash
   kubectl logs -l component=notifications --tail=100
   ```

3. Add notification retry
   ```typescript
   await notifier.notify(approvalId, {
     channels: ['email', 'slack'],  // Try multiple channels
     retry: {
       maxAttempts: 3,
       delayMs: 5000
     }
   });
   ```

4. Verify assignee email addresses
   ```bash
   # Check database for typos
   SELECT * FROM approvals WHERE approval_id = 'appr-123';
   ```

## Database Issues

### Database Connection Failures

**Symptoms:**
- "Connection refused" errors
- Workflow execution fails immediately

**Solutions:**
1. Verify PostgreSQL is running
   ```bash
   # Check service status
   systemctl status postgresql
   
   # Start service
   systemctl start postgresql
   
   # For Docker
   docker ps | grep postgres
   docker start serviceos-postgres
   ```

2. Check connection string
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT 1"
   
   # Verify credentials
   psql -h localhost -U postgres -c "SELECT version()"
   ```

3. Check firewall rules
   ```bash
   # Allow PostgreSQL port
   sudo ufw allow 5432/tcp
   
   # Test connectivity
   nc -zv localhost 5432
   ```

4. Increase connection pool
   ```env
   DATABASE_POOL_SIZE=50
   DATABASE_IDLE_TIMEOUT=900
   ```

### Database Performance Degradation

**Symptoms:**
- Queries run slowly
- High CPU/memory usage
- Connection timeouts

**Solutions:**
1. Analyze slow queries
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   
   -- Analyze query plan
   EXPLAIN ANALYZE SELECT * FROM workflows WHERE status='running';
   ```

2. Create missing indexes
   ```sql
   -- Check existing indexes
   \d workflows
   
   -- Add index for common queries
   CREATE INDEX idx_workflows_status ON workflows(status);
   ```

3. Optimize database configuration
   ```conf
   # postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   work_mem = 4MB
   ```

4. Monitor and cleanup
   ```sql
   -- Vacuum and analyze
   VACUUM ANALYZE;
   
   -- Check table sizes
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables 
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

## API Issues

### 401 Unauthorized Errors

**Symptoms:**
- API requests return 401
- "Invalid API key" or "Token expired"

**Solutions:**
1. Verify API key
   ```bash
   # Check if API key is set
   echo $API_KEY
   
   # Verify format (should be long string)
   echo $API_KEY | wc -c
   ```

2. Check token expiration
   ```bash
   # Decode JWT token
   echo $TOKEN | jq '.'
   
   # Check expiration time
   echo $TOKEN | jq '.exp'
   ```

3. Regenerate credentials
   - Go to account settings
   - Create new API key
   - Update application configuration

4. Check authorization headers
   ```bash
   curl -H "Authorization: Bearer $API_KEY" \
     http://api.serviceos.com/health
   ```

### Rate Limiting (429 Too Many Requests)

**Symptoms:**
- API requests return 429
- "Rate limit exceeded"

**Solutions:**
1. Implement exponential backoff
   ```typescript
   const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
   await new Promise(r => setTimeout(r, delay));
   ```

2. Add request queuing
   ```typescript
   const queue = [];
   
   async function queueRequest(fn) {
     queue.push(fn);
     if (queue.length === 1) {
       await processQueue();
     }
   }
   ```

3. Upgrade tier if needed
   - Free: 1,000 req/min
   - Professional: 5,000 req/min
   - Enterprise: Unlimited

4. Batch requests
   ```bash
   # Instead of individual requests
   curl -X POST /api/batch \
     -d '{"operations": [...]}'
   ```

## Deployment Issues

### Container Won't Start

**Symptoms:**
- Docker container exits immediately
- "CrashLoopBackOff" in Kubernetes

**Solutions:**
1. Check container logs
   ```bash
   docker logs serviceos-api
   kubectl logs -l app=serviceos --tail=50
   ```

2. Verify environment variables
   ```bash
   docker run -it \
     -e DATABASE_URL=postgresql://... \
     -e API_KEY=... \
     serviceos:latest
   ```

3. Check resource limits
   ```bash
   # Increase memory if needed
   docker run -m 2g serviceos:latest
   ```

4. Verify volume mounts
   ```bash
   docker run -v /data:/data serviceos:latest
   ```

### High Memory Usage

**Symptoms:**
- Container using excessive memory
- OOM (Out of Memory) errors

**Solutions:**
1. Set memory limits
   ```yaml
   resources:
     limits:
       memory: "2Gi"
     requests:
       memory: "1Gi"
   ```

2. Enable memory profiling
   ```bash
   NODE_OPTIONS=--heapsnapshot-on-oom npm start
   ```

3. Reduce cache size
   ```env
   REDIS_MAX_MEMORY=500mb
   REDIS_EVICTION_POLICY=allkeys-lru
   ```

4. Monitor memory leaks
   ```bash
   # Generate heap snapshot
   kill -USR2 $(pgrep -f "node")
   
   # Analyze with clinic.js
   clinic doctor -- npm start
   ```

## Monitoring & Logging

### How to Enable Debug Logging

```bash
# Set log level
export LOG_LEVEL=debug

# For Docker
docker run -e LOG_LEVEL=debug serviceos:latest

# For Kubernetes
kubectl set env deployment/serviceos-api LOG_LEVEL=debug
```

### Check Application Logs

```bash
# Docker
docker logs -f serviceos-api

# Kubernetes
kubectl logs -f deployment/serviceos-api

# Local development
npm run dev 2>&1 | tee app.log
```

### Monitor System Health

```bash
# Check service status
curl http://localhost:3000/health

# Check detailed metrics
curl http://localhost:3000/metrics

# Check readiness
curl http://localhost:3000/ready
```

## Getting Help

If issues persist:

1. **Check Documentation**
   - [Architecture Guide](./ARCHITECTURE.md)
   - [Deployment Guide](./DEPLOYMENT_GUIDE.md)
   - [API Reference](./API_REFERENCE.md)

2. **Search Community**
   - [GitHub Issues](https://github.com/ChaitanyaJoshi1769/ServiceOS/issues)
   - [GitHub Discussions](https://github.com/ChaitanyaJoshi1769/ServiceOS/discussions)

3. **Contact Support**
   - Email: support@serviceos.com
   - Slack: [Join Community](https://serviceos.slack.com)
   - Status Page: https://status.serviceos.com

4. **Report Bugs**
   - [Create GitHub Issue](https://github.com/ChaitanyaJoshi1769/ServiceOS/issues/new)
   - Include error messages, logs, and steps to reproduce

---

**Last Updated:** 2024-05-23
