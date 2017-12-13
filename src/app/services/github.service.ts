import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'app/services/electron.service';

var compareVersions = require('compare-versions');

interface GithubRelease {
  tag_name: string
  zipball_url: string
}

interface Release { 
  version: string
  downloadUrl: string  
}

@Injectable()
export class GithubService {

  constructor(
    private http: HttpClient,
    private electronService: ElectronService
  ) { }

  getNewRelease(): Observable<Release | null> {
    const currentVersion = this.electronService.getVersion()

    // get releases from github
    return this.http.get<GithubRelease[]>("https://api.github.com/repos/maxmumford/123-trello-timer/releases")

        // map them onto our release object
        .map(grs => {
          return grs.map(gr => {
            return {
              version: gr.tag_name,
              downloadUrl: gr.zipball_url
            }
          })
        })

        // extract latest release and return it
        .map(releases => {
          let latest = this.getLatestRelease(releases)
          if(compareVersions(latest.version, currentVersion) >= 1)
            return latest
          return null
        })
  }

  private getLatestRelease(releases: Release[]){
    if(releases.length == 0)
      return null
    let sortedVersions = releases.map(r => r.version)
        .sort(compareVersions)
    let latestVersionNumber = sortedVersions[sortedVersions.length - 1]
    for(let r of releases){
      if(r.version == latestVersionNumber)
        return r
    }
    return null
  }

}
