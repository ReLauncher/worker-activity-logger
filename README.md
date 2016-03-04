# ReLauncher | Worker Activity Logger

#### Setup worker browser logs collection for your tasks in 5 steps:

1. fork this repository,
2. create a bucket in [Firebase](https://www.firebase.com/) (it is free),
3. insert your firebase bucket name in [logger.js](https://github.com/ReLauncher/worker-activity-logger/blob/gh-pages/logger.js#L17):

  ```javascript
  var settings = {
            debug: true,
            firebase: {
                bucket: "YOUR_FIREBASE_BUCKET_NAME"
            }
        }
  ```
4. [create a job](https://success.crowdflower.com/hc/en-us/articles/204056975-Getting-Started-on-CrowdFlower-An-Overview-to-Building-a-Job) in CrowdFlower, upload your data. Make sure you have a column, which can be used as an identificator of a given data row (unit). If you collect tags for images, it can be *image_url*
5. add the following in [CML](https://success.crowdflower.com/hc/en-us/articles/202817989-CML-CrowdFlower-Markup-Language-Overview) of your CrowdFlower job: 

  ```html
  <script src="https://YOUR_GITHUB_USERNAME.github.io/worker-activity-logger/logger.js"></script>
  <script>
  EDA_LOGGER.init({
  key_name:"KEY_COLUMN_NAME",
  key_value:"{{KEY_COLUMN_NAME}}",
  task_id: YOUR_CROWDFLOWER_JOB_ID
  });
  </script>
  ```

When you launch the job you should see logs appearing in your firebase bucket. If you do not - check all the steps carefully. If it still does not work, create an *issue* in this repository.

- [ ] run unit_references_maker.js (once)
- [ ] run queue_management.js (keep it running during execution)
- [ ] run ReLauncher server (npm start)
- [ ] launch the job
- [ ] start ReLauncher for this job

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
